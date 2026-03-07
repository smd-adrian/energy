import { Country } from './countries.model';

export interface Company {
  id: number;
  name: string;
  country: Country;
}

export interface CompanyUpsertRequest {
  name: string;
  country: {
    id: number;
  };
}
