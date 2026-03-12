// merge: Une varios "chorros" de eventos(clics, mouse, teclado) en uno solo.
// switchMap: Es como un interruptor.Si estabas contando y ocurre un nuevo movimiento, tira el contador viejo a la basura y empieza uno nuevo de 5 minutos.
// throttleTime: Le dice a Angular: "No te estreses, si el usuario mueve el mouse locamente, solo reinicia el contador una vez cada 2 segundos".

import { Injectable, inject } from '@angular/core';
import { fromEvent, merge, throttleTime, switchMap, timer, Subscription } from 'rxjs';
import { AuthService } from './auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private authService = inject(AuthService);
  private router = inject(Router);
  private inactivitySubscription?: Subscription;

  // 1. Definimos el tiempo de inactividad (Ejemplo: 5 minutos)
  // 5 minutos * 60 segundos * 1000 milisegundos
  // private readonly INACTIVITY_TIME = 5 * 60 * 1000;
  private readonly INACTIVITY_TIME = 60 * 1000;

  constructor() { }

  // 2. Método para empezar a vigilar
  startMonitoring() {
    this.stopMonitoring(); // Limpiamos cualquier monitoreo previo

    // Escuchamos estos eventos en la ventana (window)
    const activityEvents$ = merge(
      fromEvent(window, 'mousemove'),
      fromEvent(window, 'click'),
      fromEvent(window, 'keydown'),
      fromEvent(window, 'scroll')
    ).pipe(
      // throttleTime(2000) evita que el procesador trabaje de más 
      // si mueves el mouse muy rápido
      throttleTime(2000)
    );

    this.inactivitySubscription = activityEvents$.pipe(
      // switchMap hace la magia: cada vez que detecta un evento,
      // cancela el timer anterior y empieza uno nuevo desde cero.
      switchMap(() => timer(this.INACTIVITY_TIME))
    ).subscribe(() => {
      // Si el timer llega al final sin ser interrumpido por un evento:
      console.log('Inactividad detectada. Cerrando sesión...');
      this.logoutUser();
    });
  }

  // 3. Método para dejar de vigilar
  stopMonitoring() {
    if (this.inactivitySubscription) {
      this.inactivitySubscription.unsubscribe();
    }
  }

  private logoutUser() {
    this.authService.logout();
    this.stopMonitoring();
    this.router.navigate(['/login']);
  }
}