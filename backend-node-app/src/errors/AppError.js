export class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message)

    this.details = details
    this.statusCode = statusCode
  }
}
