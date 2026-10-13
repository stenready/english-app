const cardPaddings = {
  NONE: 'none',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
} as const

export type CardPadding = (typeof cardPaddings)[keyof typeof cardPaddings]

export default cardPaddings
