export interface RuntimeStatus {
  timestamp: string
  uptime: number
}

export const getRuntimeStatus = (): RuntimeStatus => ({
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
})
