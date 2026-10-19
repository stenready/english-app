import { toast, type ToasterProps } from 'vue-sonner'

const TOAST_DURATION_MS = 4000

// All toast settings in one place: App.vue spreads them on <Toaster />
export const toasterOptions: ToasterProps = {
  position: 'top-right',
  // Colored background per type: red error, green success…
  richColors: true,
  closeButton: true,
  // One under another; without it they stack and spread only on hover
  expand: true,
  duration: TOAST_DURATION_MS,
}

const showSuccess = (message: string): void => {
  toast.success(message)
}

const showError = (message: string): void => {
  toast.error(message)
}

const showWarning = (message: string): void => {
  toast.warning(message)
}

const showInfo = (message: string): void => {
  toast.info(message)
}

export const useToast = () => {
  return { showSuccess, showError, showWarning, showInfo }
}
