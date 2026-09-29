import type { RequestHandler } from 'express'
import { HTTP_STATUS } from '#constants/httpStatus'
import { getHealthStatus } from '#services/health'

export const getHealth: RequestHandler = (_request, response) => {
  response.status(HTTP_STATUS.OK).json({ data: getHealthStatus() })
}
