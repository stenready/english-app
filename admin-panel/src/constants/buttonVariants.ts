const buttonVariants = {
  PRIMARY: 'primary',
  INFO: 'info',
  WARNING: 'warning',
  DANGER: 'danger',
  OUTLINE: 'outline',
  OUTLINE_PRIMARY: 'outline-primary',
  OUTLINE_INFO: 'outline-info',
  OUTLINE_WARNING: 'outline-warning',
  OUTLINE_DANGER: 'outline-danger',
} as const

export type ButtonVariant = (typeof buttonVariants)[keyof typeof buttonVariants]

export default buttonVariants
