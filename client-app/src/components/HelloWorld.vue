<template>
  <section data-component-name="HelloWorld">
    <h1 class="text-3xl font-bold">{{ t('home.title') }}</h1>
    <p class="mt-3 text-slate-600">{{ t('home.description') }}</p>

    <button
        class="mt-6 rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        type="button"
        @click="counterStore.increment"
    >
      {{ t('home.counter', { count, doubleCount }) }}
    </button>
  </section>
</template>


<script setup>
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useCounterStore } from '@/stores/counter.js'

const counterStore = useCounterStore()
const { count, doubleCount } = storeToRefs(counterStore)
const { t } = useI18n()
</script>

