<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import TheLocaleSwitcher from '@/components/the/TheLocaleSwitcher.vue'
import routeNames from '@/constants/routeNames'

const COMPONENT_NAME = 'MainLayout'

defineOptions({ name: COMPONENT_NAME })

const { t } = useI18n()
</script>

<template>
  <div
    :data-component-name="COMPONENT_NAME"
    class="flex min-h-screen flex-col bg-background text-foreground"
  >
    <header class="border-b border-border px-4 py-3">
      <nav
        class="mx-auto flex max-w-3xl items-center gap-4"
        :aria-label="t('navigation.main')"
      >
        <RouterLink :to="{ name: routeNames.HOME }">
          {{ t('navigation.home') }}
        </RouterLink>

        <TheLocaleSwitcher class="ml-auto" />
      </nav>
    </header>

    <div class="mx-auto w-full max-w-3xl flex-1">
      <slot />
    </div>
  </div>
</template>
