const restUrls = {
  HEALTH: '/health',
  AUTH_REFRESH: '/auth/refresh',
  UPLOAD_IMAGES: '/uploads/images',
  USERS: '/users',
  USER: (id: number | string) => `/users/${id}`,
} as const

export default restUrls
