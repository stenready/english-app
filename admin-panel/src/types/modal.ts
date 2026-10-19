import type { ButtonVariant } from '@/constants/buttonVariants'
import type { ModalPosition } from '@/constants/modalPositions'
import type { ModalSize } from '@/constants/modalSizes'

// The argument of showModal()
export interface ConfirmModalSettings {
  title: string
  description?: string
  // Defaults: common.confirm / common.cancel
  confirmText?: string
  cancelText?: string
  confirmVariant?: ButtonVariant
  size?: ModalSize
  // Default: center
  position?: ModalPosition
  // data-modal-name: finds the modal in tests / devtools
  name?: string
}
