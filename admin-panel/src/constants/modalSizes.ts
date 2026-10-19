const modalSizes = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
} as const

export type ModalSize = (typeof modalSizes)[keyof typeof modalSizes]

export default modalSizes
