import { Routes } from '@angular/router';
import { AppLayout } from './layouts/app-layout/app-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { NAMED_ROUTES } from './routing/routes.constants';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: NAMED_ROUTES.dashboard.path,
        component: Dashboard
      },
      {
        path: '',
        redirectTo: NAMED_ROUTES.dashboard.path,
        pathMatch: 'full'
      }
      // Aquí irán los otros componentes de páginas (producción, consumo, etc.)
    ]
  }
];
