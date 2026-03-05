import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Local dev mode — no auth configured
  if (!auth['userPool']) return true;

  // Wait for session restore to finish
  if (auth.isLoading()) {
    return new Promise<boolean>((resolve) => {
      const check = setInterval(() => {
        if (!auth.isLoading()) {
          clearInterval(check);
          if (auth.isAuthenticated()) {
            resolve(true);
          } else {
            router.navigate(['/login']);
            resolve(false);
          }
        }
      }, 50);
    });
  }

  if (auth.isAuthenticated()) return true;

  router.navigate(['/login']);
  return false;
};
