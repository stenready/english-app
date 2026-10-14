<script setup lang="ts">
const COMPONENT_NAME = 'IconPencil'

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
    <path d="M10.5 2.5 13.5 5.5 5.5 13.5H2.5V10.5Z" />
    <path d="m9 4 3 3" />
  </svg>
</template>
