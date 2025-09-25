import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[] | undefined;

  if (authService.isAuthenticated()) {
    if (!requiredRoles || authService.hasAnyRole(requiredRoles)) {
      return true;
    } 
    router.navigate(['/forbidden']);
    return false;
  }
  return authService.refreshToken().pipe(
    map((newToken) => {
      if (newToken) {
        if (!requiredRoles || authService.hasAnyRole(requiredRoles)) {
          return true;
        }
        router.navigate(['/forbidden']);
        return false;
      }
      router.navigate(['/login']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
