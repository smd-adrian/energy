import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  ChartData,
  DashboardResponse,
  Filter,
  Metric,
  RegionalData,
} from '../models/dashboard.model';
import { Users, UserUpsertRequest } from '../models/users.model';
import { Country, CountryUpsertRequest } from '../models/countries.model';
import { Region, RegionUpsertRequest } from '../models/regions.model';
import { Company, CompanyUpsertRequest } from '../models/companies.model';
import { EnergyType, EnergyTypeUpsertRequest } from '../models/energytypes.model';
import { PowerPlant, PowerPlantUpsertRequest } from '../models/powerplants.model';
import { MeasurementType, MeasurementTypeUpsertRequest } from '../models/measurementtypes.model';
import { EnergyRecord, EnergyRecordUpsertRequest } from '../models/energyrecords.model';
import { RenewableProductionItem, TopWindCountryItem } from '../models/production.model';
import {
  GlobalConsumptionParticipationItem,
  RenewableConsumptionByRegionItem,
} from '../models/consumption.model';
import { SolarCapacityTrendItem } from '../models/capacity.model';

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

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.apiUrl}/countrys`);
  }

  getCountryById(id: number): Observable<Country> {
    return this.http.get<Country>(`${this.apiUrl}/countrys/${id}`);
  }

  createCountry(country: CountryUpsertRequest): Observable<Country> {
    return this.http.post<Country>(`${this.apiUrl}/countrys`, country);
  }

  updateCountry(id: number, country: CountryUpsertRequest): Observable<Country> {
    return this.http.put<Country>(`${this.apiUrl}/countrys/${id}`, country);
  }

  deleteCountry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/countrys/${id}`);
  }

  getRegions(): Observable<Region[]> {
    return this.http.get<Region[]>(`${this.apiUrl}/regions`);
  }

  getRegionById(id: number): Observable<Region> {
    return this.http.get<Region>(`${this.apiUrl}/regions/${id}`);
  }

  createRegion(region: RegionUpsertRequest): Observable<Region> {
    return this.http.post<Region>(`${this.apiUrl}/regions`, region);
  }

  updateRegion(id: number, region: RegionUpsertRequest): Observable<Region> {
    return this.http.put<Region>(`${this.apiUrl}/regions/${id}`, region);
  }

  deleteRegion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/regions/${id}`);
  }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.apiUrl}/companys`);
  }

  getCompanyById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/companys/${id}`);
  }

  createCompany(company: CompanyUpsertRequest): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}/companys`, company);
  }

  updateCompany(id: number, company: CompanyUpsertRequest): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/companys/${id}`, company);
  }

  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/companys/${id}`);
  }

  getEnergyTypes(): Observable<EnergyType[]> {
    return this.http.get<EnergyType[]>(`${this.apiUrl}/energytypes`);
  }

  getEnergyTypeById(id: number): Observable<EnergyType> {
    return this.http.get<EnergyType>(`${this.apiUrl}/energytypes/${id}`);
  }

  createEnergyType(energyType: EnergyTypeUpsertRequest): Observable<EnergyType> {
    return this.http.post<EnergyType>(`${this.apiUrl}/energytypes`, energyType);
  }

  updateEnergyType(id: number, energyType: EnergyTypeUpsertRequest): Observable<EnergyType> {
    return this.http.put<EnergyType>(`${this.apiUrl}/energytypes/${id}`, energyType);
  }

  deleteEnergyType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/energytypes/${id}`);
  }

  getPowerPlants(): Observable<PowerPlant[]> {
    return this.http.get<PowerPlant[]>(`${this.apiUrl}/powerplants`);
  }

  createPowerPlant(powerPlant: PowerPlantUpsertRequest): Observable<PowerPlant> {
    return this.http.post<PowerPlant>(`${this.apiUrl}/powerplants`, powerPlant);
  }

  getMeasurementTypes(): Observable<MeasurementType[]> {
    return this.http.get<MeasurementType[]>(`${this.apiUrl}/measurementypes`);
  }

  createMeasurementType(
    measurementType: MeasurementTypeUpsertRequest,
  ): Observable<MeasurementType> {
    return this.http.post<MeasurementType>(`${this.apiUrl}/measurementypes`, measurementType);
  }

  getEnergyRecords(): Observable<EnergyRecord[]> {
    return this.http.get<EnergyRecord[]>(`${this.apiUrl}/energyrecords`);
  }

  getEnergyRecordById(id: number): Observable<EnergyRecord> {
    return this.http.get<EnergyRecord>(`${this.apiUrl}/energyrecords/${id}`);
  }

  createEnergyRecord(energyRecord: EnergyRecordUpsertRequest): Observable<EnergyRecord> {
    return this.http.post<EnergyRecord>(`${this.apiUrl}/energyrecords`, energyRecord);
  }

  updateEnergyRecord(
    id: number,
    energyRecord: EnergyRecordUpsertRequest,
  ): Observable<EnergyRecord> {
    return this.http.put<EnergyRecord>(`${this.apiUrl}/energyrecords/${id}`, energyRecord);
  }

  deleteEnergyRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/energyrecords/${id}`);
  }

  getRenewableProductionByYear(year: number): Observable<RenewableProductionItem[]> {
    return this.http.get<RenewableProductionItem[]>(
      `${this.apiUrl}/energyrecords/produccion-renovable/${year}`,
    );
  }

  getTopWindCountriesByYear(year: number): Observable<TopWindCountryItem[]> {
    return this.http.get<TopWindCountryItem[]>(
      `${this.apiUrl}/energyrecords/top-10-paises-eolico/${year}`,
    );
  }

  getRenewableConsumptionPercentageByYear(
    year: number,
  ): Observable<RenewableConsumptionByRegionItem[]> {
    return this.http.get<RenewableConsumptionByRegionItem[]>(
      `${this.apiUrl}/energyrecords/porcentaje-renovable/${year}`,
    );
  }

  getGlobalConsumptionParticipationByYear(
    year: number,
  ): Observable<GlobalConsumptionParticipationItem[]> {
    return this.http.get<GlobalConsumptionParticipationItem[]>(
      `${this.apiUrl}/energyrecords/participacion-consumo/${year}`,
    );
  }

  getSolarCapacityTrend(): Observable<SolarCapacityTrendItem[]> {
    return this.http.get<SolarCapacityTrendItem[]>(`${this.apiUrl}/energyrecords/tendencia-solar`);
  }

  getDashboardData(filters: Filter): Observable<DashboardResponse> {
    const params = new URLSearchParams();

    if (filters.year) {
      params.set('year', String(filters.year));
    }

    if (filters.country) {
      params.set('country', filters.country);
    }

    if (filters.energyType) {
      params.set('energyType', filters.energyType);
    }

    const query = params.toString();
    const endpoint = query ? `${this.apiUrl}/dashboard?${query}` : `${this.apiUrl}/dashboard`;

    return this.http.get<DashboardResponse>(endpoint);
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
