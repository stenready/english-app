export class AppError extends Error {
  readonly statusCode: number
  readonly details: unknown

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message)

    this.details = details
    this.statusCode = statusCode
  }
}
