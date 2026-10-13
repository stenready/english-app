const inputSizes = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
} as const

export type InputSize = (typeof inputSizes)[keyof typeof inputSizes]

export default inputSizes
