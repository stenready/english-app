import { isProduction } from '#config/env'
import { HTTP_STATUS } from '#constants/httpStatus'
import { AppError } from '#errors/AppError'

export const errorHandler = (error, _request, response, _next) => {
  const isExpectedError = error instanceof AppError
  const statusCode = isExpectedError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR

  if (!isExpectedError) {
    console.error(error)
  }

  response.status(statusCode).json({
    error: {
      details: isExpectedError ? error.details : undefined,
      message: isExpectedError || !isProduction ? error.message : 'Internal server error.',
    },
  })
}
