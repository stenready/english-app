<script setup lang="ts">
const COMPONENT_NAME = 'IconTrash'

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
    <path d="M2.5 4.5h11M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5" />
    <path
      d="M4 4.5 4.6 13a1 1 0 0 0 1 1h4.8a1 1 0 0 0 1-1L12 4.5M6.75 7v4M9.25 7v4"
    />
  </svg>
</template>
