export interface MeasurementType {
  id: number;
  name: string;
  unit: string;
}

export interface MeasurementTypeUpsertRequest {
  name: string;
  unit: string;
}
