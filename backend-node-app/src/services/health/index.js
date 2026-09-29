import { getRuntimeStatus } from '#repositories/health'

export const getHealthStatus = () => ({
  status: 'ok',
  ...getRuntimeStatus(),
})
