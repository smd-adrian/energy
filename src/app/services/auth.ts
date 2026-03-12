import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
// export class Auth {}
export class AuthService {
  // Cambia esta URL por la de tu backend si es diferente
  private apiUrl = 'http://149.130.174.114:8080/api/users';

  constructor(private http: HttpClient) { }

  // 1. MÉTODO PARA HACER LOGIN
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Si el login es exitoso y trae un token, lo guardamos
        if (response && response.token) {
          this.setToken(response.token);
          // Opcional: guardar también el username o rol
          localStorage.setItem('username', response.username);
          localStorage.setItem('role', response.role);
        }
      })
    );
  }

  // 2. GUARDAR EL TOKEN EN EL NAVEGADOR
  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  // 3. RECUPERAR EL TOKEN (Lo usaremos después para las consultas)
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // 4. CERRAR SESIÓN
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  }

  // 5. SABER SI ESTÁ LOGUEADO
  isLoggedIn(): boolean {
    return !!this.getToken(); // Devuelve true si hay token
  }
  // En auth.ts, dentro de la clase AuthService

  getUsername(): string | null {
    return localStorage.getItem('username');
  }
  getRole(): string | null {
    return localStorage.getItem('role');
  }
  //Método de conveniencia para preguntar si tiene un rol específico
  hasRole(role: string): boolean {
    return this.getRole() === role;
  }
}