import type { ErrorRequestHandler } from 'express'
import { isProduction } from '#config/env'
import { HTTP_STATUS } from '#constants/httpStatus'
import { AppError } from '#errors/AppError'

const INTERNAL_ERROR_MESSAGE = 'Internal server error.'

// Errors from express/body-parser (invalid JSON → 400, body too large → 413) carry
// their own status; `expose` is true when the message is safe to show to the client
interface HttpError {
  status: number
  expose: boolean
  message: string
}

const isHttpError = (error: unknown): error is HttpError =>
  error instanceof Error &&
  'status' in error &&
  typeof error.status === 'number' &&
  'expose' in error &&
  typeof error.expose === 'boolean'

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  // Response already started: let Express close the connection
  if (response.headersSent) {
    next(error)
    return
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: { details: error.details, message: error.message },
    })
    return
  }

  if (isHttpError(error) && error.expose) {
    response.status(error.status).json({ error: { message: error.message } })
    return
  }

  console.error(error)

  response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: {
      message: isProduction ? INTERNAL_ERROR_MESSAGE : error.message,
    },
  })
}
