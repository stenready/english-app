import type { ErrorCode } from '#constants/errorCodes'

export class AppError extends Error {
  readonly statusCode: number
  readonly code: ErrorCode
  readonly details: unknown

  constructor(statusCode: number, code: ErrorCode, message: string, details?: unknown) {
    super(message)

    this.code = code
    this.details = details
    this.statusCode = statusCode
  }
}
