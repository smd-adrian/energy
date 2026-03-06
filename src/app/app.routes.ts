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
        path: '',
        redirectTo: NAMED_ROUTES.dashboard.path,
        pathMatch: 'full',
      },
      // Aquí irán los otros componentes de páginas (producción, consumo, etc.)
    ],
  },
];
