import { ref, shallowRef } from 'vue'
import type { ConfirmModalSettings } from '@/types/modal'

interface ModalRequest {
  // A new id remounts the modal: a new call never reuses a closing one
  id: number
  settings: ConfirmModalSettings
  resolve: (isConfirmed: boolean) => void
}

// Module level: one modal for the whole app, rendered by AppConfirmModal
const request = shallowRef<ModalRequest | null>(null)
const isOpen = ref(false)
let lastId = 0

const settle = (isConfirmed: boolean): void => {
  request.value?.resolve(isConfirmed)
  isOpen.value = false
}

// true: confirmed; false: cancelled or closed
const showModal = (settings: ConfirmModalSettings): Promise<boolean> => {
  // An unanswered previous modal counts as cancelled
  if (isOpen.value) settle(false)

  return new Promise<boolean>((resolve) => {
    lastId++
    request.value = { id: lastId, settings, resolve }
    isOpen.value = true
  })
}

// Settings stay until the closing animation ends
const clear = (): void => {
  request.value = null
}

export const useGlobalModal = () => {
  return { showModal }
}

// Only for AppConfirmModal: renders the modal from this state
export const useGlobalModalHost = () => {
  return { request, isOpen, settle, clear }
}
