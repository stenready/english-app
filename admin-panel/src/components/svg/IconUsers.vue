<script setup lang="ts">
const COMPONENT_NAME = 'IconUsers'

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
    <circle cx="6" cy="5" r="2.5" />
    <path d="M1.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
    <path d="M10.5 2.8a2.5 2.5 0 0 1 0 4.4" />
    <path d="M12 9.8c1.5.5 2.5 1.8 2.5 3.7" />
  </svg>
</template>
