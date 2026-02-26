import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { getRoutePath } from '../../routing/routes.constants';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  toggleMenu = output<void>();
  getRoutePath = getRoutePath;
  
  logout() {
    // Aquí puedes implementar la lógica de cerrar sesión
    console.log('Cerrando sesión...');
    // Por ejemplo: this.authService.logout();
    // o redirigir: window.location.href = '/login';
  }
}
