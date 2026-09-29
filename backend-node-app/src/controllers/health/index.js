import { HTTP_STATUS } from '#constants/httpStatus'
import { getHealthStatus } from '#services/health'

export const getHealth = (_request, response) => {
  response.status(HTTP_STATUS.OK).json({ data: getHealthStatus() })
}
