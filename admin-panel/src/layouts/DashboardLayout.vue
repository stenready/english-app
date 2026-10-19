<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import TheBreadcrumbs from '@/components/the/TheBreadcrumbs.vue'
import TheLocaleSwitcher from '@/components/the/TheLocaleSwitcher.vue'
import IconUsers from '@/components/svg/IconUsers.vue'
import routeNames from '@/constants/routeNames'

const COMPONENT_NAME = 'DashboardLayout'

defineOptions({ name: COMPONENT_NAME })

const { t } = useI18n()
</script>

<template>
  <div
    :data-component-name="COMPONENT_NAME"
    class="flex h-screen flex-col bg-canvas bg-canvas-gradient text-foreground"
  >
    <header class="flex h-14 shrink-0 items-center gap-3 px-4">
      <!-- w-60 + px-4 = the sidebar width: crumbs start where the page panel does -->
      <div class="w-60 shrink-0">
        <RouterLink
          :to="{ name: routeNames.HOME }"
          class="inline-flex items-center gap-2 rounded-md px-2 py-1 font-semibold hover:bg-nav-hover"
        >
          <span
            class="flex size-7 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground"
            aria-hidden="true"
          >
            {{ t('layout.appName').charAt(0) }}
          </span>
          {{ t('layout.appName') }}
        </RouterLink>
      </div>

      <TheBreadcrumbs class="min-w-0" />

      <TheLocaleSwitcher class="ml-auto" />
    </header>

    <div class="flex min-h-0 flex-1">
      <aside class="w-64 shrink-0 overflow-y-auto px-2 pb-4">
        <nav class="flex flex-col gap-0.5" :aria-label="t('navigation.main')">
          <RouterLink
            :to="{ name: routeNames.USERS }"
            class="relative flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-nav-hover"
            active-class="bg-nav-active font-semibold before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-nav-indicator"
          >
            <IconUsers class="size-4 shrink-0 text-muted" />
            {{ t('navigation.users') }}
          </RouterLink>
        </nav>
      </aside>

      <div
        class="mr-4 mb-2 min-w-0 flex-1 overflow-y-auto rounded-lg border border-border bg-background shadow-sm"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
