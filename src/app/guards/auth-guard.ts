import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth'; // Verifica que la ruta sea correcta

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el servicio dice que hay token, permitimos el paso
  if (authService.isLoggedIn()) {
    return true;
  }

  // Si no hay token, lo mandamos al login
  console.log('Acceso denegado: Redirigiendo al login...');
  router.navigate(['/login']);
  return false;
};