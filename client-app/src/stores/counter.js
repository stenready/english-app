import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const INITIAL_COUNT = 0
const COUNT_MULTIPLIER = 2

export const useCounterStore = defineStore('counter', () => {
  const count = ref(INITIAL_COUNT)
  const doubleCount = computed(() => count.value * COUNT_MULTIPLIER)

  const increment = () => {
    count.value += 1
  }

  return { count, doubleCount, increment }
})
