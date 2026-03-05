import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, first, map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isConfigured) return true;

  if (auth.isLoading()) {
    return toObservable(auth.isLoading).pipe(
      filter(loading => !loading),
      first(),
      map(() => auth.isAuthenticated() || router.createUrlTree(['/login'])),
    );
  }

  return auth.isAuthenticated() || router.createUrlTree(['/login']);
};
