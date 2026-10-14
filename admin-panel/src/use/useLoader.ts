import { computed, readonly, ref } from 'vue'

// Module level: one counter for the whole app.
// A counter, not a boolean: with parallel requests the first stop must not hide the loader
const pendingCount = ref(0)

const isLoading = computed<boolean>(() => {
  return pendingCount.value > 0
})

const startLoading = (): void => {
  pendingCount.value++
}

// Call in finally: an error must not leave the overlay on
const stopLoading = (): void => {
  pendingCount.value = Math.max(0, pendingCount.value - 1)
}

export const useLoader = () => {
  return {
    isLoading: readonly(isLoading),
    startLoading,
    stopLoading,
  }
}
