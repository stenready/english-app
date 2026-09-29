const errorCodes = {
  NETWORK: 'NETWORK',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION: 'VALIDATION',
  HTTP: 'HTTP',
  GRAPHQL: 'GRAPHQL',
  UNKNOWN: 'UNKNOWN',
} as const

export type ErrorCode = (typeof errorCodes)[keyof typeof errorCodes]

export default errorCodes
