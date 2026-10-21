import { useI18n } from 'vue-i18n'
import { rest } from '@/api'
import buttonVariants from '@/constants/buttonVariants'
import modalPositions from '@/constants/modalPositions'
import restUrls from '@/constants/restUrls'
import { processingError } from '@/helpers/apiErrors'
import { useGlobalModal } from '@/use/useGlobalModal'
import { useLoader } from '@/use/useLoader'
import { useToast } from '@/use/useToast'
import type { User } from '@/types/user'

// Confirm → DELETE → toast: the same in the list and on the edit page
export const useDeleteUser = () => {
  const { t } = useI18n()
  const { showModal } = useGlobalModal()
  const { startLoading, stopLoading } = useLoader()
  const { showSuccess } = useToast()

  // true: deleted; false: cancelled or failed (the error is in a toast)
  const deleteUser = async (user: User): Promise<boolean> => {
    const isConfirmed = await showModal({
      title: t('users.delete.title'),
      description: t('users.delete.description', { name: user.name }),
      confirmText: t('users.list.actionDelete'),
      confirmVariant: buttonVariants.DANGER,
      name: 'delete-user',
      position: modalPositions.TOP,
    })

    if (!isConfirmed) return false

    startLoading()

    try {
      await rest.delete(restUrls.USER(user.id))
      showSuccess(t('users.delete.success'))

      return true
    } catch (error) {
      processingError(error, { showToast: true })

      return false
    } finally {
      stopLoading()
    }
  }

  return { deleteUser }
}
