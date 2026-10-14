<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppSelect from '@/components/app/forms/AppSelect.vue'
import type { Locale } from '@/plugins/i18n'
import type { AppSelectOption } from '@/types/select'

const COMPONENT_NAME = 'TheLocaleSwitcher'

defineOptions({ name: COMPONENT_NAME })

const { locale, t } = useI18n({ useScope: 'global' })

// Each language in its own name: findable whatever the current language is
const LOCALE_OPTIONS: AppSelectOption<Locale>[] = [
  { value: 'ru', label: 'Русский' },
  { value: 'uk', label: 'Українська' },
  { value: 'en', label: 'English' },
]
</script>

<template>
  <div :data-component-name="COMPONENT_NAME" class="inline-flex">
    <AppSelect
      v-model="locale"
      :options="LOCALE_OPTIONS"
      size="sm"
      :aria-label="t('navigation.language')"
    />
  </div>
</template>
