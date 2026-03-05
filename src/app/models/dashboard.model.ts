export interface Metric {
  label: string;
  value: string;
  icon: string;
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
  year?: string;
  region?: string;
  source?: string;
}
