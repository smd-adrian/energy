import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Topbar } from '../../components/topbar/topbar';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, Sidebar, Topbar],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {
  isSidebarOpen = signal(false);

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
