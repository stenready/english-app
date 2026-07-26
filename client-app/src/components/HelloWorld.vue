<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore } from '../stores/counter'

const counterStore = useCounterStore()
const { count, doubleCount } = storeToRefs(counterStore)
</script>

<template>
  <section>
    <h1 class="text-3xl font-bold">Vue 3 + Vite</h1>
    <p class="mt-3 text-slate-600">Router, Pinia и Tailwind подключены.</p>

    <button
      class="mt-6 rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
      type="button"
      @click="counterStore.increment"
    >
      Счётчик: {{ count }} (x2: {{ doubleCount }})
    </button>
  </section>
</template>
