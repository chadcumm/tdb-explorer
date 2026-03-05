import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="login-shell">
      <div class="login-card">
        <p class="login-label">TDB Explorer</p>
        <h1 class="login-title">
          @switch (view()) {
            @case ('forgotRequest') { Reset Password }
            @case ('forgotConfirm') { Enter Code }
            @default { Sign In }
          }
        </h1>
        <p class="login-subtitle">tdb-explorer.cernertools.com</p>

        @if (auth.needsNewPassword()) {
          <p class="new-pw-msg">Please set a new password to continue.</p>
          <input
            type="password"
            placeholder="New password"
            class="login-input"
            [value]="newPassword()"
            (input)="newPassword.set(getValue($event))"
            (keydown.enter)="completeNewPassword()"
          />
          <button
            (click)="completeNewPassword()"
            [disabled]="loading()"
            class="login-btn"
          >{{ loading() ? 'Setting password...' : 'Set Password' }}</button>
        } @else {
          @switch (view()) {
            @case ('forgotRequest') {
              <p class="login-hint">Enter your email and we'll send a verification code.</p>
              <input
                type="email"
                placeholder="Email"
                class="login-input"
                [value]="email()"
                (input)="email.set(getValue($event))"
                (keydown.enter)="requestResetCode()"
              />
              <button (click)="requestResetCode()" [disabled]="loading()" class="login-btn">
                {{ loading() ? 'Sending code...' : 'Send Code' }}
              </button>
              <button (click)="view.set('login'); errorMsg.set(''); successMsg.set('')" class="login-btn-secondary">
                Back to Sign In
              </button>
            }
            @case ('forgotConfirm') {
              <p class="login-hint">Check your email for a verification code.</p>
              <input
                type="text"
                placeholder="Verification code"
                class="login-input"
                [value]="resetCode()"
                (input)="resetCode.set(getValue($event))"
              />
              <input
                type="password"
                placeholder="New password"
                class="login-input"
                [value]="newPassword()"
                (input)="newPassword.set(getValue($event))"
                (keydown.enter)="confirmResetPassword()"
              />
              <button (click)="confirmResetPassword()" [disabled]="loading()" class="login-btn">
                {{ loading() ? 'Resetting...' : 'Reset Password' }}
              </button>
              <button (click)="view.set('forgotRequest'); errorMsg.set(''); successMsg.set('')" class="login-btn-secondary">
                Back
              </button>
            }
            @default {
              <input
                type="email"
                placeholder="Email"
                class="login-input"
                [value]="email()"
                (input)="email.set(getValue($event))"
                (keydown.enter)="signIn()"
              />
              <input
                type="password"
                placeholder="Password"
                class="login-input"
                [value]="password()"
                (input)="password.set(getValue($event))"
                (keydown.enter)="signIn()"
              />
              <button (click)="signIn()" [disabled]="loading()" class="login-btn">
                {{ loading() ? 'Signing in...' : 'Sign In' }}
              </button>
              <button (click)="view.set('forgotRequest'); errorMsg.set('')" class="login-link">
                Forgot password?
              </button>
            }
          }
        }

        @if (errorMsg()) {
          <p class="login-error">{{ errorMsg() }}</p>
        }
        @if (successMsg()) {
          <p class="login-success">{{ successMsg() }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .login-shell {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--canvas);
    }
    .login-card {
      background: var(--surface-1);
      border: 1px solid var(--border);
      padding: 2rem;
      width: 400px;
      max-width: 90vw;
    }
    .login-label {
      font-size: 0.625rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ink-muted);
      margin: 0 0 0.25rem;
    }
    .login-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--ink-primary);
      margin: 0 0 0.25rem;
    }
    .login-subtitle {
      font-size: 0.75rem;
      color: var(--ink-muted);
      margin: 0 0 1.5rem;
    }
    .login-hint {
      font-size: 0.75rem;
      color: var(--ink-muted);
      margin: 0 0 0.75rem;
    }
    .new-pw-msg {
      font-size: 0.875rem;
      color: var(--accent);
      margin: 0 0 0.75rem;
    }
    .login-input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      background: var(--control-bg, var(--surface-2));
      border: 1px solid var(--border);
      color: var(--ink-primary);
      font-family: var(--font-body);
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
      outline: none;
      box-sizing: border-box;
    }
    .login-input:focus { border-color: var(--accent); }
    .login-btn {
      width: 100%;
      padding: 0.5rem 0.75rem;
      background: var(--accent);
      color: #fff;
      font-size: 0.875rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: opacity 0.12s;
    }
    .login-btn:hover { opacity: 0.9; }
    .login-btn:disabled { opacity: 0.5; cursor: default; }
    .login-btn-secondary {
      width: 100%;
      margin-top: 0.75rem;
      padding: 0.5rem 0.75rem;
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--ink-muted);
      font-size: 0.875rem;
      cursor: pointer;
      transition: color 0.12s;
    }
    .login-btn-secondary:hover { color: var(--ink-primary); }
    .login-link {
      display: block;
      width: 100%;
      margin-top: 0.75rem;
      background: none;
      border: none;
      color: var(--ink-muted);
      font-size: 0.75rem;
      cursor: pointer;
      text-align: center;
      transition: color 0.12s;
    }
    .login-link:hover { color: var(--accent); }
    .login-error { font-size: 0.75rem; color: #dc2626; margin: 0.75rem 0 0; }
    .login-success { font-size: 0.75rem; color: #16a34a; margin: 0.75rem 0 0; }
  `]
})
export class LoginComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  readonly view = signal<'login' | 'forgotRequest' | 'forgotConfirm'>('login');
  email = signal('');
  password = signal('');
  newPassword = signal('');
  resetCode = signal('');
  loading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  async signIn(): Promise<void> {
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      await this.auth.signIn(this.email(), this.password());
      if (!this.auth.needsNewPassword()) {
        this.router.navigate(['/']);
      }
    } catch (err: any) {
      this.errorMsg.set(err.message || 'Sign in failed');
    } finally {
      this.loading.set(false);
    }
  }

  async completeNewPassword(): Promise<void> {
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      await this.auth.completeNewPassword(this.newPassword());
      this.router.navigate(['/']);
    } catch (err: any) {
      this.errorMsg.set(err.message || 'Failed to set password');
    } finally {
      this.loading.set(false);
    }
  }

  async requestResetCode(): Promise<void> {
    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');
    try {
      await this.auth.forgotPassword(this.email());
      this.view.set('forgotConfirm');
      this.successMsg.set('Verification code sent to your email.');
    } catch (err: any) {
      this.errorMsg.set(err.message || 'Failed to send code');
    } finally {
      this.loading.set(false);
    }
  }

  async confirmResetPassword(): Promise<void> {
    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');
    try {
      await this.auth.confirmPassword(this.resetCode(), this.newPassword());
      this.view.set('login');
      this.successMsg.set('Password reset successfully. Sign in with your new password.');
      this.resetCode.set('');
      this.newPassword.set('');
    } catch (err: any) {
      this.errorMsg.set(err.message || 'Failed to reset password');
    } finally {
      this.loading.set(false);
    }
  }
}
