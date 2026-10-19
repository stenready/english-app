<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppBreadcrumbs from '@/components/app/AppBreadcrumbs.vue'
import routeNames from '@/constants/routeNames'
import type { AppBreadcrumb } from '@/types/breadcrumbs'

const COMPONENT_NAME = 'TheBreadcrumbs'

defineOptions({ name: COMPONENT_NAME })

const route = useRoute()
const { t } = useI18n()

// From route.meta.breadcrumbs, with "Home" in front of every page but the home page
const items = computed<AppBreadcrumb[]>(() => {
  const crumbs = route.meta.breadcrumbs ?? []

  if (!crumbs.length) return []

  return [
    { title: t('navigation.home'), to: { name: routeNames.HOME } },
    ...crumbs.map((crumb) => {
      return { title: t(crumb.titleKey), to: crumb.to }
    }),
  ]
})
</script>

<template>
  <AppBreadcrumbs :items="items" />
</template>
