import { Routes } from '@angular/router';
import { AppLayout } from './layouts/app-layout/app-layout';
import { NAMED_ROUTES } from './routing/routes.constants';
import { Dashboard } from './pages/dashboard/dashboard';
import { Users } from './pages/users/list/users';
import { Create } from './pages/users/create/create';
import { Update } from './pages/users/update/update';
import { List as CountriesList } from './pages/countries/list/list';
import { Create as CountriesCreate } from './pages/countries/create/create';
import { Update as CountriesUpdate } from './pages/countries/update/update';
import { List as RegionsList } from './pages/regions/list/list';
import { Create as RegionsCreate } from './pages/regions/create/create';
import { Update as RegionsUpdate } from './pages/regions/update/update';
import { List as CompaniesList } from './pages/companies/list/list';
import { Create as CompaniesCreate } from './pages/companies/create/create';
import { Update as CompaniesUpdate } from './pages/companies/update/update';
import { List as EnergyTypesList } from './pages/energytypes/list/list';
import { Create as EnergyTypesCreate } from './pages/energytypes/create/create';
import { Update as EnergyTypesUpdate } from './pages/energytypes/update/update';
import { List as PowerPlantsList } from './pages/powerplants/list/list';
import { Create as PowerPlantsCreate } from './pages/powerplants/create/create';
import { List as MeasurementTypesList } from './pages/measurementtypes/list/list';
import { Create as MeasurementTypesCreate } from './pages/measurementtypes/create/create';
import { List as EnergyRecordsList } from './pages/energyrecords/list/list';
import { Create as EnergyRecordsCreate } from './pages/energyrecords/create/create';
import { Update as EnergyRecordsUpdate } from './pages/energyrecords/update/update';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: NAMED_ROUTES.dashboard.path,
        component: Dashboard,
      },
      {
        path: NAMED_ROUTES.users.path,
        component: Users,
      },
      {
        path: NAMED_ROUTES.usersCreate.path,
        component: Create,
      },
      {
        path: `${NAMED_ROUTES.usersUpdate.path}/:id`,
        component: Update,
      },
      {
        path: NAMED_ROUTES.countries.path,
        component: CountriesList,
      },
      {
        path: NAMED_ROUTES.countriesCreate.path,
        component: CountriesCreate,
      },
      {
        path: `${NAMED_ROUTES.countriesUpdate.path}/:id`,
        component: CountriesUpdate,
      },
      {
        path: NAMED_ROUTES.regions.path,
        component: RegionsList,
      },
      {
        path: NAMED_ROUTES.regionsCreate.path,
        component: RegionsCreate,
      },
      {
        path: `${NAMED_ROUTES.regionsUpdate.path}/:id`,
        component: RegionsUpdate,
      },
      {
        path: NAMED_ROUTES.companies.path,
        component: CompaniesList,
      },
      {
        path: NAMED_ROUTES.companiesCreate.path,
        component: CompaniesCreate,
      },
      {
        path: `${NAMED_ROUTES.companiesUpdate.path}/:id`,
        component: CompaniesUpdate,
      },
      {
        path: NAMED_ROUTES.energyTypes.path,
        component: EnergyTypesList,
      },
      {
        path: NAMED_ROUTES.energyTypesCreate.path,
        component: EnergyTypesCreate,
      },
      {
        path: `${NAMED_ROUTES.energyTypesUpdate.path}/:id`,
        component: EnergyTypesUpdate,
      },
      {
        path: NAMED_ROUTES.powerPlants.path,
        component: PowerPlantsList,
      },
      {
        path: NAMED_ROUTES.powerPlantsCreate.path,
        component: PowerPlantsCreate,
      },
      {
        path: NAMED_ROUTES.measurementTypes.path,
        component: MeasurementTypesList,
      },
      {
        path: NAMED_ROUTES.measurementTypesCreate.path,
        component: MeasurementTypesCreate,
      },
      {
        path: NAMED_ROUTES.energyRecords.path,
        component: EnergyRecordsList,
      },
      {
        path: NAMED_ROUTES.energyRecordsCreate.path,
        component: EnergyRecordsCreate,
      },
      {
        path: `${NAMED_ROUTES.energyRecordsUpdate.path}/:id`,
        component: EnergyRecordsUpdate,
      },
      {
        path: '',
        redirectTo: NAMED_ROUTES.dashboard.path,
        pathMatch: 'full',
      },
      // Aquí irán los otros componentes de páginas (producción, consumo, etc.)
    ],
  },
];
