<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import TheLocaleSwitcher from '@/components/the/TheLocaleSwitcher.vue'

const COMPONENT_NAME = 'AuthLayout'

defineOptions({ name: COMPONENT_NAME })

const { t } = useI18n()
</script>

<template>
  <div :data-component-name="COMPONENT_NAME">
    <header class="border-b border-slate-200 px-6 py-4">
      <nav
        class="mx-auto flex max-w-5xl items-center gap-4"
        :aria-label="t('navigation.main')"
      >
        <RouterLink to="/">{{ t('navigation.home') }}</RouterLink>
        <RouterLink to="/about">{{ t('navigation.about') }}</RouterLink>

        <TheLocaleSwitcher class="ml-auto" />
      </nav>
    </header>

    <slot />
  </div>
</template>
