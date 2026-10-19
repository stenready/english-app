<script setup lang="ts">
const COMPONENT_NAME = 'IconImage'

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
    <rect x="2" y="2.5" width="12" height="11" rx="2" />
    <circle cx="5.75" cy="6.25" r="1.25" />
    <path d="m14 10.5-3.2-3.2a1 1 0 0 0-1.4 0L3 13.5" />
  </svg>
</template>
