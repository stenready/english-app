const layoutNames = {
  AUTH: 'auth',
  MAIN: 'main',
} as const

export type LayoutName = (typeof layoutNames)[keyof typeof layoutNames]

export default layoutNames
