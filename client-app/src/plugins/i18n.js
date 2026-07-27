import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import ru from '../locales/ru.json'
import uk from '../locales/uk.json'

const DEFAULT_LOCALE = 'ru'

const messages = {
  en,
  ru,
  uk,
}

const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  flatJson: true,
  messages,
})

export default i18n
