<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import TheLocaleSwitcher from '@/components/the/TheLocaleSwitcher.vue'

const COMPONENT_NAME = 'DashboardLayout'

defineOptions({ name: COMPONENT_NAME })

const { t } = useI18n()
</script>

<template>
  <div :data-component-name="COMPONENT_NAME" class="flex min-h-screen">
    <aside class="w-60 shrink-0 border-r border-slate-200 px-4 py-6">
      <nav class="flex flex-col gap-3" :aria-label="t('navigation.main')">
        <RouterLink to="/">{{ t('navigation.home') }}</RouterLink>
        <RouterLink to="/about">{{ t('navigation.about') }}</RouterLink>
      </nav>

      <TheLocaleSwitcher class="mt-6" />
    </aside>

    <div class="min-w-0 flex-1">
      <slot />
    </div>
  </div>
</template>
