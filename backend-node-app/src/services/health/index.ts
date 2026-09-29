import { getRuntimeStatus, type RuntimeStatus } from '#repositories/health'

const HEALTH_STATUS_OK = 'ok'

export interface HealthStatus extends RuntimeStatus {
  status: typeof HEALTH_STATUS_OK
}

export const getHealthStatus = (): HealthStatus => ({
  status: HEALTH_STATUS_OK,
  ...getRuntimeStatus(),
})
