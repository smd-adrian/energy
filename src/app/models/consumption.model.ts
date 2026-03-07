export interface RenewableConsumptionByRegionItem {
  region: string;
  produccionRenovable: number;
  consumoTotal: number;
  porcentaje: number | null;
}

export interface GlobalConsumptionParticipationItem {
  fuente: string;
  consumoFuente: number;
  porcentajeParticipacion: number | null;
}
