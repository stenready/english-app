const routeNames = {
  HOME: 'HOME',
  ABOUT: 'ABOUT',
  NOT_FOUND: 'NOT_FOUND',
} as const

export type RouteName = (typeof routeNames)[keyof typeof routeNames]

export default routeNames
