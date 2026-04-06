import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

function redirectToLogin(router: Router): UrlTree {
  return router.createUrlTree(['/login']);
}

export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return redirectToLogin(router);
  }

  if (!authService.hasRole('ADMIN')) {
    return redirectToLogin(router);
  }

  return true;
};

export const etudiantGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return redirectToLogin(router);
  }

  return true;
};
