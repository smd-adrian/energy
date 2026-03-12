import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Topbar } from '../../components/topbar/topbar';
import { InactivityService } from '../../services/inactivity';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, Topbar],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {
  isSidebarOpen = signal(false);

  private inactivityService = inject(InactivityService);

  ngOnInit(): void {
    // Apenas se carga el layout (después del login), empezamos a vigilar
    console.log('Iniciando monitoreo de inactividad...');
    this.inactivityService.startMonitoring();
  }

  ngOnDestroy(): void {
    // Si el componente se destruye (por ejemplo, al cerrar sesión), dejamos de vigilar
    this.inactivityService.stopMonitoring();
  }


  toggleSidebar() {
    this.isSidebarOpen.update(value => !value);
    // Cerrar en mobile
    if (window.innerWidth > 992) {
      setTimeout(() => {
        this.isSidebarOpen.set(false);
      }, 300); // Esperar a que termines la animación
    }
  }
}
