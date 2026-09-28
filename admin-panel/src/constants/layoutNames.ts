const layoutNames = {
  AUTH: 'auth',
  DASHBOARD: 'dashboard',
} as const

export type LayoutName = (typeof layoutNames)[keyof typeof layoutNames]

export default layoutNames
