import { Routes } from '@angular/router';
import { AppLayout } from './layouts/app-layout/app-layout';
import { NAMED_ROUTES } from './routing/routes.constants';
import { Dashboard } from './pages/dashboard/dashboard';
import { Users } from './pages/users/list/users';
import { Create } from './pages/users/create/create';
import { Update } from './pages/users/update/update';

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
        path: '',
        redirectTo: NAMED_ROUTES.dashboard.path,
        pathMatch: 'full',
      },
      // Aquí irán los otros componentes de páginas (producción, consumo, etc.)
    ],
  },
];
