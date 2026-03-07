export const NAMED_ROUTES = {
  dashboard: {
    name: 'dashboard',
    path: 'dashboard',
  },
  users: {
    name: 'users',
    path: 'usuarios',
  },
  usersCreate: {
    name: 'usersCreate',
    path: 'usuarios/crear',
  },
  usersUpdate: {
    name: 'usersUpdate',
    path: 'usuarios/editar',
  },
  countries: {
    name: 'countries',
    path: 'paises',
  },
  countriesCreate: {
    name: 'countriesCreate',
    path: 'paises/crear',
  },
  countriesUpdate: {
    name: 'countriesUpdate',
    path: 'paises/editar',
  },
  regions: {
    name: 'regions',
    path: 'regiones',
  },
  regionsCreate: {
    name: 'regionsCreate',
    path: 'regiones/crear',
  },
  regionsUpdate: {
    name: 'regionsUpdate',
    path: 'regiones/editar',
  },
  companies: {
    name: 'companies',
    path: 'empresas',
  },
  companiesCreate: {
    name: 'companiesCreate',
    path: 'empresas/crear',
  },
  companiesUpdate: {
    name: 'companiesUpdate',
    path: 'empresas/editar',
  },
  energyTypes: {
    name: 'energyTypes',
    path: 'tipos-energia',
  },
  energyTypesCreate: {
    name: 'energyTypesCreate',
    path: 'tipos-energia/crear',
  },
  energyTypesUpdate: {
    name: 'energyTypesUpdate',
    path: 'tipos-energia/editar',
  },
  powerPlants: {
    name: 'powerPlants',
    path: 'plantas-energia',
  },
  powerPlantsCreate: {
    name: 'powerPlantsCreate',
    path: 'plantas-energia/crear',
  },
  produccion: {
    name: 'produccion',
    path: 'produccion',
  },
  consumo: {
    name: 'consumo',
    path: 'consumo',
  },
  capacidad: {
    name: 'capacidad',
    path: 'capacidad',
  },
  comparativas: {
    name: 'comparativas',
    path: 'comparativas',
  },
} as const;

/**
 * Helper function to get the full path of a route by its name.
 * @param routeName - The name of the route as defined in NAMED_ROUTES
 * @returns The full path of the route
 */
export function getRoutePath(routeName: keyof typeof NAMED_ROUTES): string {
  return '/' + NAMED_ROUTES[routeName].path;
}

export function getUserUpdatePath(id: number): string {
  return `/${NAMED_ROUTES.usersUpdate.path}/${id}`;
}

export function getCountryUpdatePath(id: number): string {
  return `/${NAMED_ROUTES.countriesUpdate.path}/${id}`;
}

export function getRegionUpdatePath(id: number): string {
  return `/${NAMED_ROUTES.regionsUpdate.path}/${id}`;
}

export function getCompanyUpdatePath(id: number): string {
  return `/${NAMED_ROUTES.companiesUpdate.path}/${id}`;
}

export function getEnergyTypeUpdatePath(id: number): string {
  return `/${NAMED_ROUTES.energyTypesUpdate.path}/${id}`;
}
