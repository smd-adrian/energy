import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Metric, RegionalData, ChartData, Filter } from '../models/dashboard.model';
import { Users, UserUpsertRequest } from '../models/users.model';

@Injectable({
  providedIn: 'root',
})
export class EnergyService {
  private apiUrl = 'http://127.0.0.1:8080/api';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<Users[]> {
    return this.http.get<Users[]>(`${this.apiUrl}/users`);
  }

  getUserById(id: number): Observable<Users> {
    return this.http.get<Users>(`${this.apiUrl}/users/${id}`);
  }

  createUser(user: UserUpsertRequest): Observable<Users> {
    return this.http.post<Users>(`${this.apiUrl}/users`, user);
  }

  updateUser(id: number, user: UserUpsertRequest): Observable<Users> {
    return this.http.put<Users>(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  /**
   * Obtiene las métricas principales del dashboard
   */
  getMetrics(): Observable<Metric[]> {
    // Por ahora retornamos datos mock, luego reemplaza con tu API
    return of([
      { label: 'Producción Total', value: '1,245 TWh', icon: 'bi-speedometer2' },
      { label: 'Energía Renovable', value: '62%', icon: 'bi-lightning' },
      { label: 'Capacidad Solar', value: '890 GW', icon: 'bi-sun' },
      { label: 'Top País Eólico', value: 'Alemania 🇩🇪', icon: 'bi-wind' },
    ]);
    // return this.http.get<Metric[]>(`${this.apiUrl}/metrics`);
  }

  /**
   * Obtiene datos de producción de energía renovable por años
   */
  getEnergyProductionChart(): Observable<ChartData> {
    return of({
      labels: ['2014', '2016', '2018', '2020', '2022', '2024'],
      datasets: [
        { label: 'Solar', data: [100, 200, 300, 500, 700, 900] },
        { label: 'Eólica', data: [150, 250, 400, 600, 800, 1000] },
        { label: 'Hidro', data: [80, 120, 150, 200, 250, 300] },
        { label: 'Biomasa', data: [60, 100, 180, 300, 400, 500] },
      ],
    });
    // return this.http.get<ChartData>(`${this.apiUrl}/energy-chart`);
  }

  /**
   * Obtiene datos regionales de energía
   */
  getRegionalData(): Observable<RegionalData[]> {
    return of([
      { region: 'Europa', produccion: 450, consumo: 320, porcentajeRenovable: 68 },
      { region: 'América del Norte', produccion: 320, consumo: 540, porcentajeRenovable: 59 },
      { region: 'Asia', produccion: 300, consumo: 700, porcentajeRenovable: 43 },
      { region: 'América Latina', produccion: 130, consumo: 180, porcentajeRenovable: 72 },
      { region: 'África', produccion: 45, consumo: 90, porcentajeRenovable: 50 },
    ]);
    // return this.http.get<RegionalData[]>(`${this.apiUrl}/regional-data`);
  }

  /**
   * Aplica filtros a los datos
   */
  applyFilters(filters: Filter): Observable<any> {
    // Aquí conectarías con tu API para filtrar datos
    console.log('Filtros aplicados:', filters);
    return of({ success: true });
  }
}
