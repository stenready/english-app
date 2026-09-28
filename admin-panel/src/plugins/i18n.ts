import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import ru from '@/locales/ru.json'
import uk from '@/locales/uk.json'

export type Locale = 'en' | 'ru' | 'uk'
export type MessageSchema = typeof en

const DEFAULT_LOCALE: Locale = 'uk'

const messages: Record<Locale, MessageSchema> = {
  // Flat keys only: a nested object in en.json fails the type check
  en: en satisfies Record<string, string>,
  ru,
  uk,
}

const i18n = createI18n<[MessageSchema], Locale, false>({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  flatJson: true,
  messages,
})

export default i18n
