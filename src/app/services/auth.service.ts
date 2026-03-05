import { Injectable } from '@angular/core';
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
import { BehaviorSubject } from 'rxjs';

export interface AuthUser {
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isLoadingSubject = new BehaviorSubject<boolean>(true);
  private needsNewPasswordSubject = new BehaviorSubject<boolean>(false);

  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  readonly isLoading$ = this.isLoadingSubject.asObservable();
  readonly needsNewPassword$ = this.needsNewPasswordSubject.asObservable();

  private userPool: CognitoUserPool | null = null;
  private cognitoUser: CognitoUser | null = null;

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  get isLoading(): boolean {
    return this.isLoadingSubject.value;
  }

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  get needsNewPassword(): boolean {
    return this.needsNewPasswordSubject.value;
  }

  constructor() {
    if (environment.cognito.userPoolId) {
      this.userPool = new CognitoUserPool({
        UserPoolId: environment.cognito.userPoolId,
        ClientId: environment.cognito.clientId,
      });
      this.restoreSession();
    } else {
      this.isLoadingSubject.next(false);
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
      this.currentUserSubject.next({ email: cookieEmail });
      this.isAuthenticatedSubject.next(true);
      this.isLoadingSubject.next(false);
      return;
    }

    const user = this.userPool?.getCurrentUser();
    if (!user) {
      this.isLoadingSubject.next(false);
      return;
    }

    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      this.isLoadingSubject.next(false);
      if (err || !session?.isValid()) return;

      this.cognitoUser = user;
      const email = user.getUsername();
      this.currentUserSubject.next({ email });
      this.isAuthenticatedSubject.next(true);
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
          this.currentUserSubject.next({ email });
          this.isAuthenticatedSubject.next(true);
          this.needsNewPasswordSubject.next(false);
          this.writeCookies(session, email);
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: () => {
          this.cognitoUser = user;
          this.needsNewPasswordSubject.next(true);
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
          this.currentUserSubject.next({ email });
          this.isAuthenticatedSubject.next(true);
          this.needsNewPasswordSubject.next(false);
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
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.clearCookies();
  }
}
