import { Component, input, inject } from '@angular/core'; // Añadimos inject
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { getRoutePath } from '../../routing/routes.constants';
import { AuthService } from '../../services/auth'; // Importamos el servicio

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  isSidebarOpen = input<boolean>(false);
  getRoutePath = getRoutePath;

  // Inyectamos el servicio de autenticación
  private authService = inject(AuthService);

  // Creamos un método para verificar en el HTML si es admin
  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN'); // 'ADMIN' debe coincidir con el nombre del rol en tu DB
  }
}