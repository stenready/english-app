<script setup lang="ts">
const COMPONENT_NAME = 'IconEyeOff'

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
    <path
      d="M6.6 3.65A6.4 6.4 0 0 1 8 3.5c4.1 0 6.5 4.5 6.5 4.5a11.6 11.6 0 0 1-1.6 2.2M4.2 4.7C2.5 5.9 1.5 8 1.5 8s2.4 4.5 6.5 4.5a6.3 6.3 0 0 0 3.3-.9"
    />
    <path d="M6.6 6.6a2 2 0 0 0 2.8 2.8M2 2l12 12" />
  </svg>
</template>
