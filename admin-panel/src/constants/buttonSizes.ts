// Same heights as inputSizes, so a button and an input line up in one row
const buttonSizes = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
} as const

export type ButtonSize = (typeof buttonSizes)[keyof typeof buttonSizes]

export default buttonSizes
