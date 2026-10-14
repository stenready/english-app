import recordStatuses from '@/constants/recordStatuses'
import type { UserRecord } from '@/types/userRecord'

const RECORDS_COUNT = 40
const HASH_LENGTH = 40
const HEX_RADIX = 16
const FIRST_ID = 1001

// Park–Miller generator: same "random" data on every load
const PRNG_MULTIPLIER = 48271
const PRNG_MODULUS = 2147483647

const NAMES = [
  'stas.radchenko',
  'iryna.honchar',
  'alex.khomenko',
  'yuriy.ivasheniuk',
  'valeriia.borkunova',
  'volodymyr.malyshko',
  'olena.kravets',
  'maksym.lysenko',
  'sofiia.melnyk',
  'taras.shevchuk',
]

const STATUSES = Object.values(recordStatuses)

const DESCRIPTIONS = [
  'Адміністратор розділу словників.',
  'Додає тексти для читання та перевіряє переклади нових слів перед публікацією у застосунку.',
  'Тестовий акаунт для перевірки оплат.',
  'Модерує коментарі користувачів, відповідає на звернення в підтримку та веде щотижневий звіт про активність.',
  'Новий користувач, ще не підтвердив email.',
]

const SECRET_WORDS = ['sunflower', 'harbor', 'lantern', 'meadow', 'orbit']

const ROLES = ['admin', 'editor', 'moderator', 'viewer']
const COUNTRIES = ['UA', 'PL', 'DE', 'CZ', 'BG']
const EMAIL_DOMAIN = 'example.com'

const IP_PREFIX = '192.168'
const IP_OCTET_RANGE = 256

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000
const BASE_DATE = Date.UTC(2026, 9, 1)
const MAX_ACCOUNT_AGE_DAYS = 365
const MAX_HOURS_SINCE_LOGIN = 24 * 30

const createRandom = (seed: number) => {
  let state = seed

  return (): number => {
    state = (state * PRNG_MULTIPLIER) % PRNG_MODULUS
    return state
  }
}

const createHash = (random: () => number): string => {
  return Array.from({ length: HASH_LENGTH }, () =>
    (random() % HEX_RADIX).toString(HEX_RADIX),
  ).join('')
}

const pick = <T>(list: T[], index: number): T => {
  return list[index % list.length]
}

export const userRecords: UserRecord[] = Array.from(
  { length: RECORDS_COUNT },
  (_, index) => {
    const random = createRandom(index + 1)
    const userName = `${pick(NAMES, index)}${index >= NAMES.length ? index : ''}`

    return {
      id: FIRST_ID + index,
      userName,
      status: pick(STATUSES, random()),
      description: pick(DESCRIPTIONS, random()),
      hash: createHash(random),
      secretWord: pick(SECRET_WORDS, random()),
      email: `${userName}@${EMAIL_DOMAIN}`,
      role: pick(ROLES, random()),
      country: pick(COUNTRIES, random()),
      ipAddress: `${IP_PREFIX}.${random() % IP_OCTET_RANGE}.${random() % IP_OCTET_RANGE}`,
      createdAt: new Date(
        BASE_DATE - (random() % MAX_ACCOUNT_AGE_DAYS) * DAY_MS,
      ).toISOString(),
      lastLoginAt: new Date(
        BASE_DATE - (random() % MAX_HOURS_SINCE_LOGIN) * HOUR_MS,
      ).toISOString(),
    }
  },
)
