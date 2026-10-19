<script setup lang="ts">
import { computed, type Component } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Toaster } from 'vue-sonner'
import AppConfirmModal from '@/components/app/AppConfirmModal.vue'
import TheLoader from '@/components/the/TheLoader.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import layoutNames, { type LayoutName } from '@/constants/layoutNames'
import { useLoader } from '@/use/useLoader'
import { toasterOptions } from '@/use/useToast'

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
  <div :data-component-name="COMPONENT_NAME" :inert="isLoading">
    <component :is="layout">
      <RouterView v-slot="{ Component: pageComponent, route: currentRoute }">
        <Transition
          mode="out-in"
          enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
          enter-from-class="translate-y-1 opacity-0"
          leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
          leave-to-class="opacity-0"
        >
          <component :is="pageComponent" :key="currentRoute.path" />
        </Transition>
      </RouterView>
    </component>
  </div>

  <AppConfirmModal />
  <TheLoader />
  <Toaster v-bind="toasterOptions" />
</template>
