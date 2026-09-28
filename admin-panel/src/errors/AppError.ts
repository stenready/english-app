import { FetchError } from 'ofetch'
import httpStatus from '@/constants/httpStatus'
import errorCodes, { type ErrorCode } from './errorCodes'

interface ServerErrorBody {
  error?: {
    message?: string
    details?: unknown
  }
}

interface AppErrorOptions {
  code?: ErrorCode
  // null: no HTTP error status (network failure, GraphQL errors, client-side error)
  statusCode?: number | null
  details?: unknown
  cause?: unknown
}

const UNKNOWN_ERROR_MESSAGE = 'Unknown error'

const getHttpErrorCode = (statusCode: number | undefined): ErrorCode => {
  if (statusCode === undefined) {
    return errorCodes.NETWORK
  }

  if (statusCode === httpStatus.UNAUTHORIZED) {
    return errorCodes.UNAUTHORIZED
  }

  if (statusCode === httpStatus.UNPROCESSABLE_ENTITY) {
    return errorCodes.VALIDATION
  }

  return errorCodes.HTTP
}

export class AppError extends Error {
  readonly code: ErrorCode
  readonly statusCode: number | null
  readonly details: unknown

  constructor(
    message: string,
    {
      code = errorCodes.UNKNOWN,
      statusCode = null,
      details,
      cause,
    }: AppErrorOptions = {},
  ) {
    super(message, { cause })
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }

  static from(error: unknown): AppError {
    if (error instanceof AppError) {
      return error
    }

    if (error instanceof FetchError) {
      const body = error.data as ServerErrorBody | undefined

      return new AppError(body?.error?.message ?? error.message, {
        code: getHttpErrorCode(error.statusCode),
        statusCode: error.statusCode ?? null,
        details: body?.error?.details,
        cause: error,
      })
    }

    if (error instanceof Error) {
      return new AppError(error.message, { cause: error })
    }

    return new AppError(UNKNOWN_ERROR_MESSAGE, { cause: error })
  }
}
