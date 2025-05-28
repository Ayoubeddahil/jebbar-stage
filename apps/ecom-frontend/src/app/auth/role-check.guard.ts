import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
} from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';
import { filter, interval, map, timeout } from 'rxjs';

export const roleCheckGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const authorities = next.data['authorities'] as string[];
    return interval(50).pipe(
      filter(() => authService.isAuthenticated()),
      map(() => authorities.every(authority => authService.hasRole(authority))),
      timeout(3000)
    );
  } else {
    return false;
  }
};
