<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Locale } from '@/plugins/i18n'

const COMPONENT_NAME = 'TheLocaleSwitcher'

defineOptions({ name: COMPONENT_NAME })

const { locale, t } = useI18n({ useScope: 'global' })

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: 'ru', label: 'Русский' },
  { value: 'uk', label: 'Українська' },
  { value: 'en', label: 'English' },
]
</script>

<template>
  <label
    :data-component-name="COMPONENT_NAME"
    class="flex items-center gap-2"
    for="locale"
  >
    <span class="sr-only">{{ t('navigation.language') }}</span>
    <select
      id="locale"
      v-model="locale"
      class="rounded border border-slate-300 px-2 py-1"
    >
      <option
        v-for="option in LOCALE_OPTIONS"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </label>
</template>
