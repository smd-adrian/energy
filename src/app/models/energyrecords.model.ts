import { MeasurementType } from './measurementtypes.model';
import { PowerPlant } from './powerplants.model';

export interface EnergyRecord {
  id: number;
  year: number;
  month: number;
  value: number;
  powerPlant: PowerPlant;
  measurementType: MeasurementType;
}

export interface EnergyRecordUpsertRequest {
  year: number;
  month: number;
  value: number;
  powerPlant: {
    id: number;
  };
  measurementType: {
    id: number;
  };
}
