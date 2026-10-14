<script setup lang="ts">
const COMPONENT_NAME = 'IconSort'

defineOptions({ name: COMPONENT_NAME })

// Without a direction: ↑↓ (sortable, not sorted); with one: a single arrow
const props = defineProps<{
  direction?: 'asc' | 'desc'
}>()
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
      v-if="props.direction"
      d="M8 13V3M4.5 6.5 8 3l3.5 3.5"
      :transform="props.direction === 'desc' ? 'rotate(180 8 8)' : undefined"
    />
    <path
      v-else
      d="M5 13V3M2.5 5.5 5 3l2.5 2.5M11 3v10M8.5 10.5 11 13l2.5-2.5"
    />
  </svg>
</template>
