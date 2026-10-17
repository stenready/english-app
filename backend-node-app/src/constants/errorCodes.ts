// Machine-readable codes in every error response: { error: { code, message, details? } }.
// Clients translate by code; message is English, for logs and debugging
export const ERROR_CODES = Object.freeze({
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  INTERNAL: 'INTERNAL',
  // Malformed request from express/body-parser: invalid JSON, body too large…
  INVALID_REQUEST: 'INVALID_REQUEST',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
} as const)

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]
