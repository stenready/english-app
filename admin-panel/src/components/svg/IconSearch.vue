<script setup lang="ts">
const COMPONENT_NAME = 'IconSearch'

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
    aria-hidden="true"
  >
    <circle cx="7" cy="7" r="4.75" />
    <path d="m10.5 10.5 3.5 3.5" />
  </svg>
</template>
