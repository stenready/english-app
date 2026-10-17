import type { z } from 'zod'
import { ERROR_CODES } from '#constants/errorCodes'
import { HTTP_STATUS } from '#constants/httpStatus'
import { AppError } from '#errors/AppError'

interface ValidationIssue {
  // Dotted path for nested fields: "address.city"; empty for the whole value
  field: string
  // Zod issue code: "too_small", "invalid_format"… Clients translate by it
  code: string
  // Values for the translation: { origin: 'string', minimum: 2 }, { format: 'email' }…
  params: Record<string, unknown>
  // English text from Zod, for logs and debugging
  message: string
}

// Valid: the parsed (coerced, trimmed, defaulted) value.
// Invalid: 422 with every issue at once, in the API's { field, code, params, message } format
export const parseOrThrow = <TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown,
): z.output<TSchema> => {
  const result = schema.safeParse(value)

  if (!result.success) {
    const issues: ValidationIssue[] = result.error.issues.map((issue) => {
      const { code, path, message, ...params } = issue

      return { field: path.map(String).join('.'), code, params, message }
    })

    throw new AppError(
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ERROR_CODES.VALIDATION_FAILED,
      'Validation failed.',
      issues,
    )
  }

  return result.data
}
