import type { RequestHandler } from 'express'
import { HTTP_STATUS } from '#constants/httpStatus'
import { AppError } from '#errors/AppError'

export const notFound: RequestHandler = (request, _response, next) => {
  next(
    new AppError(
      HTTP_STATUS.NOT_FOUND,
      `Route ${request.method} ${request.originalUrl} was not found.`,
    ),
  )
}
