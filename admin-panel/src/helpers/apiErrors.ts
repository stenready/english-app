import i18n, { DEFAULT_LOCALE } from '@/plugins/i18n'
import { AppError } from '@/errors/AppError'
import errorCodes from '@/errors/errorCodes'
import { useToast } from '@/use/useToast'

// One item of details in a 422 response (backend parseOrThrow)
interface ApiValidationIssue {
  field: string
  // Zod issue code: "too_small", "invalid_format"…
  code: string
  // { origin: 'string', minimum: 2 }, { format: 'email' }…
  params: Record<string, unknown>
}

// te() checks uk: it has every key, other locales fall back to it
const { t, te } = i18n.global

export const getErrorMessage = (
  error: AppError,
  isServerMessage = false,
): string => {
  if (isServerMessage) return error.message

  const key = `apiErrors.${error.serverCode ?? error.code}`

  return te(key, DEFAULT_LOCALE) ? t(key) : t('apiErrors.default')
}

export const getFieldErrors = (error: AppError): Record<string, string> => {
  if (error.code !== errorCodes.VALIDATION) return {}

  const issues = error.details as ApiValidationIssue[]

  return Object.fromEntries(
    issues.map(({ field, code, params }) => {
      const key = `apiValidation.${code}.${String(params.format ?? params.origin)}`
      const message = te(key, DEFAULT_LOCALE)
        ? t(key, params)
        : t('apiValidation.default')

      return [field, message]
    }),
  )
}

interface ProcessingErrorSettings {
  isServerMessage?: boolean
  // Also shows the text in a toast (Toaster in App.vue)
  showToast?: boolean
}

// Any caught error → the text to show
export const processingError = (
  error: unknown,
  settings: ProcessingErrorSettings = {},
): string => {
  const message = getErrorMessage(
    AppError.from(error),
    settings.isServerMessage,
  )

  if (settings.showToast) useToast().showError(message)

  return message
}
