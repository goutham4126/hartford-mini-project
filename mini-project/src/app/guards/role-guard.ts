import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const roleGuard = (role: 'admin' | 'agent' | 'customer'): CanActivateFn => {
  return () => {
    const auth = inject(Auth);
    const router = inject(Router);

    if (auth.user()?.role !== role) {
      router.navigate(['/unauthorized'])
      return false;
    }

    return true;
  };
};
