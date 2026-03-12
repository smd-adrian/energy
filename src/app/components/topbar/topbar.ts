import { Component, output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { getRoutePath } from '../../routing/routes.constants';
import { AuthService } from '../../services/auth'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-topbar',
  standalone: true, // Agregado por si no lo tenías, es estándar en versiones nuevas
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar implements OnInit {
  toggleMenu = output<void>();
  getRoutePath = getRoutePath;

  // Usamos inject para las dependencias
  private authService = inject(AuthService);
  private router = inject(Router);

  userName: string = '';

  ngOnInit(): void {
    // Obtenemos el nombre real del servicio
    // Si por alguna razón es nulo, ponemos 'Usuario' por defecto
    this.userName = this.authService.getUsername() || 'Usuario';
  }

  logout() {
    // 1. Borramos el token y el nombre del localStorage
    this.authService.logout();

    // 2. Redirigimos al login
    console.log('Sesión cerrada correctamente');
    this.router.navigate(['/login']);
  }
}