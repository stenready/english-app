import { format, type Locale as DateFnsLocale } from 'date-fns'
import { enUS, ru, uk } from 'date-fns/locale'
import i18n, { type Locale } from '@/plugins/i18n'

// date-fns patterns: the same in every language
export const dateFormats = {
  DATE: 'dd.MM.yyyy',
  DATE_TIME: 'dd.MM.yyyy HH:mm:ss',
} as const

export type DateFormat = (typeof dateFormats)[keyof typeof dateFormats]

// Month and weekday names follow the app language
const DATE_FNS_LOCALES: Record<Locale, DateFnsLocale> = {
  en: enUS,
  ru,
  uk,
}

// ISO string from the API → local time of the browser
export const formatDate = (
  value: string | number | Date,
  pattern: DateFormat = dateFormats.DATE,
): string => {
  return format(value, pattern, {
    locale: DATE_FNS_LOCALES[i18n.global.locale.value],
  })
}
