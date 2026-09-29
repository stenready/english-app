<script setup lang="ts">
import { computed, type Component } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import layoutNames, { type LayoutName } from '@/constants/layoutNames'

const COMPONENT_NAME = 'App'

defineOptions({ name: COMPONENT_NAME })

const DEFAULT_LAYOUT: LayoutName = layoutNames.MAIN

const layouts: Record<LayoutName, Component> = {
  [layoutNames.AUTH]: AuthLayout,
  [layoutNames.MAIN]: MainLayout,
}

const route = useRoute()
const layout = computed(() => layouts[route.meta.layout ?? DEFAULT_LAYOUT])
</script>

<template>
  <div :data-component-name="COMPONENT_NAME">
    <component :is="layout">
      <RouterView />
    </component>
  </div>
</template>
