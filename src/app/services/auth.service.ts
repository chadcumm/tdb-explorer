import { Injectable, signal } from '@angular/core';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { environment } from '../../environments/environment';
import {
  setCernerToolsCookie,
  getCernerToolsCookie,
  clearCernerToolsCookie,
} from './cookie.utils';

export interface AuthUser {
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<AuthUser | null>(null);
  readonly isAuthenticated = signal(false);
  readonly isLoading = signal(true);
  readonly needsNewPassword = signal(false);

  private userPool: CognitoUserPool | null = null;
  private cognitoUser: CognitoUser | null = null;

  constructor() {
    if (environment.cognito.userPoolId) {
      this.userPool = new CognitoUserPool({
        UserPoolId: environment.cognito.userPoolId,
        ClientId: environment.cognito.clientId,
      });
      this.restoreSession();
    } else {
      this.isLoading.set(false);
    }
  }

  private writeCookies(session: CognitoUserSession, email: string): void {
    const idToken = session.getIdToken().getJwtToken();
    const refreshToken = session.getRefreshToken().getToken();
    setCernerToolsCookie('ct_id_token', idToken, 7);
    setCernerToolsCookie('ct_refresh_token', refreshToken, 30);
    setCernerToolsCookie('ct_user_email', email, 30);
  }

  private clearCookies(): void {
    clearCernerToolsCookie('ct_id_token');
    clearCernerToolsCookie('ct_refresh_token');
    clearCernerToolsCookie('ct_user_email');
  }

  private restoreSession(): void {
    const cookieEmail = getCernerToolsCookie('ct_user_email');
    const cookieToken = getCernerToolsCookie('ct_id_token');

    if (cookieEmail && cookieToken) {
      this.currentUser.set({ email: cookieEmail });
      this.isAuthenticated.set(true);
      this.isLoading.set(false);
      return;
    }

    const user = this.userPool?.getCurrentUser();
    if (!user) {
      this.isLoading.set(false);
      return;
    }

    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      this.isLoading.set(false);
      if (err || !session?.isValid()) return;

      this.cognitoUser = user;
      const email = user.getUsername();
      this.currentUser.set({ email });
      this.isAuthenticated.set(true);
      this.writeCookies(session, email);
    });
  }

  signIn(email: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.userPool) return reject(new Error('Auth not configured'));

      const user = new CognitoUser({
        Username: email,
        Pool: this.userPool,
      });

      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      user.authenticateUser(authDetails, {
        onSuccess: (session) => {
          this.cognitoUser = user;
          this.currentUser.set({ email });
          this.isAuthenticated.set(true);
          this.needsNewPassword.set(false);
          this.writeCookies(session, email);
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: () => {
          this.cognitoUser = user;
          this.needsNewPassword.set(true);
          resolve();
        },
      });
    });
  }

  completeNewPassword(newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.cognitoUser) return reject(new Error('No user session'));

      this.cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
        onSuccess: (session) => {
          const email = this.cognitoUser!.getUsername();
          this.currentUser.set({ email });
          this.isAuthenticated.set(true);
          this.needsNewPassword.set(false);
          this.writeCookies(session, email);
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  forgotPassword(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.userPool) return reject(new Error('Auth not configured'));

      const user = new CognitoUser({
        Username: email,
        Pool: this.userPool,
      });

      user.forgotPassword({
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err),
        inputVerificationCode: () => {
          this.cognitoUser = user;
          resolve();
        },
      });
    });
  }

  confirmPassword(code: string, newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.cognitoUser) return reject(new Error('No user session — request a code first'));

      this.cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err),
      });
    });
  }

  signOut(): void {
    this.cognitoUser?.signOut();
    this.cognitoUser = null;
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.clearCookies();
  }
}
