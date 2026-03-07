import { Company } from './companies.model';
import { Region } from './regions.model';
import { EnergyType } from './energytypes.model';

export interface PowerPlant {
  id: number;
  name: string;
  company: Company;
  region: Region;
  energyType: EnergyType;
}

export interface PowerPlantUpsertRequest {
  name: string;
  company: {
    id: number;
  };
  region: {
    id: number;
  };
  energyType: {
    id: number;
  };
}
