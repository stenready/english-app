<script setup lang="ts">
import { computed, type Component } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import TheLoader from '@/components/the/TheLoader.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import layoutNames, { type LayoutName } from '@/constants/layoutNames'
import { useLoader } from '@/use/useLoader'

const COMPONENT_NAME = 'App'

defineOptions({ name: COMPONENT_NAME })

const DEFAULT_LAYOUT: LayoutName = layoutNames.DASHBOARD

const layouts: Record<LayoutName, Component> = {
  [layoutNames.AUTH]: AuthLayout,
  [layoutNames.DASHBOARD]: DashboardLayout,
}

const route = useRoute()
const { isLoading } = useLoader()
const layout = computed(() => layouts[route.meta.layout ?? DEFAULT_LAYOUT])
</script>

<template>
  <!-- inert: the overlay stops clicks, this also stops Tab / Enter under it -->
  <div :data-component-name="COMPONENT_NAME" :inert="isLoading">
    <component :is="layout">
      <RouterView />
    </component>
  </div>

  <TheLoader />
</template>
