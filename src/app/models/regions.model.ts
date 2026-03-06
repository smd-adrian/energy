import { Country } from './countries.model';

export interface Region {
  id: number;
  name: string;
  country: Country;
}

export interface RegionUpsertRequest {
  name: string;
  country_id: number;
}
