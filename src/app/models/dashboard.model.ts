export interface Metric {
  label: string;
  value: string;
  icon: string;
}

export interface DashboardKpis {
  produccionTotal: number;
  porcentajeRenovable: number;
  capacidadSolar: number;
  topPaisEolico: string;
}

export interface DashboardHistoricalSeriesItem {
  year: number;
  tipoEnergia: string | null;
  valor: number;
}

export interface DashboardSummaryItem {
  region: string;
  produccionRenovable: number;
  consumoTotal: number;
  porcentaje: number | null;
}

export interface DashboardResponse {
  kpis: DashboardKpis;
  seriesHistorica: DashboardHistoricalSeriesItem[];
  tablaResumen: DashboardSummaryItem[];
}

export interface RegionalData {
  region: string;
  produccion: number;
  consumo: number;
  porcentajeRenovable: number;
}

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
}

export interface Filter {
  year?: number;
  country?: string;
  energyType?: string | null;
}
