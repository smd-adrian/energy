
export const NAMED_ROUTES = {
  dashboard: {
    name: 'dashboard',
    path: 'dashboard',
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
