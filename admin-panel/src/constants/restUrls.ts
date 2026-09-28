const restUrls = {
  HEALTH: '/health',
  AUTH_REFRESH: '/auth/refresh',
  USERS: '/users',
  USER: (id: number | string) => `/users/${id}`,
} as const

export default restUrls
