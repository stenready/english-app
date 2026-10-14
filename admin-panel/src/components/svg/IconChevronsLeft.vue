<script setup lang="ts">
const COMPONENT_NAME = 'IconChevronsLeft'

defineOptions({ name: COMPONENT_NAME })
</script>

<template>
  <svg
    :data-component-name="COMPONENT_NAME"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m8 4-4 4 4 4M12.5 4l-4 4 4 4" />
  </svg>
</template>
