<script setup lang="ts">
import TheLocaleSwitcher from '@/components/the/TheLocaleSwitcher.vue'

const COMPONENT_NAME = 'AuthLayout'

defineOptions({ name: COMPONENT_NAME })
</script>

<template>
  <div
    :data-component-name="COMPONENT_NAME"
    class="flex min-h-screen flex-col bg-background text-foreground"
  >
    <header class="flex justify-end px-4 py-3">
      <TheLocaleSwitcher />
    </header>

    <main class="flex flex-1 items-center justify-center px-4">
      <slot />
    </main>
  </div>
</template>
