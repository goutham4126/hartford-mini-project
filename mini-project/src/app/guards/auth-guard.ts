import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { inject } from '@angular/core';
export const authGuard: CanActivateFn = () => {
  const auth=inject(Auth)
  const router=inject(Router)

  if (!auth.isLoggedIn()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
