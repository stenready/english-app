const routeNames = {
  HOME: 'HOME',
  ABOUT: 'ABOUT',
  USERS: 'USERS',
  USERS_CREATE: 'USERS_CREATE',
  USERS_EDIT: 'USERS_EDIT',
  NOT_FOUND: 'NOT_FOUND',
} as const

export type RouteName = (typeof routeNames)[keyof typeof routeNames]

export default routeNames
