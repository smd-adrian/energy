export interface EnergyType {
  id: number;
  name: string;
  renewable: boolean;
}

export interface EnergyTypeUpsertRequest {
  name: string;
  renewable: boolean;
}
