<script setup lang="ts">
const COMPONENT_NAME = 'IconPlus'

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
    <path d="M8 3v10M3 8h10" />
  </svg>
</template>
