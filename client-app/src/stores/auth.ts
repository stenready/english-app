import { computed, onScopeDispose, ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types/user'

const ACCESS_TOKEN_KEY = 'accessToken'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  const accessToken = ref<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY))

  const isAuthed = computed<boolean>(() => Boolean(accessToken.value))

  const setToken = (token: string | null): void => {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
    }

    accessToken.value = token
  }

  const setUser = (value: User | null): void => {
    user.value = value
  }

  const handleStorage = (event: StorageEvent): void => {
    if (event.key === ACCESS_TOKEN_KEY) {
      accessToken.value = event.newValue
    }
  }

  window.addEventListener('storage', handleStorage)

  // Setup stores run in an effect scope: this fires on authStore.$dispose()
  onScopeDispose(() => {
    window.removeEventListener('storage', handleStorage)
  })

  return { user, accessToken, isAuthed, setToken, setUser }
})
