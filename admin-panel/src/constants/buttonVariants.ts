const buttonVariants = {
  PRIMARY: 'primary',
  INFO: 'info',
  WARNING: 'warning',
  OUTLINE: 'outline',
  OUTLINE_PRIMARY: 'outline-primary',
  OUTLINE_INFO: 'outline-info',
  OUTLINE_WARNING: 'outline-warning',
} as const

export type ButtonVariant = (typeof buttonVariants)[keyof typeof buttonVariants]

export default buttonVariants
