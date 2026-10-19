<script setup lang="ts">
const COMPONENT_NAME = 'AppFieldLabel'

defineOptions({ name: COMPONENT_NAME })

const props = defineProps<{
  // id of the control the label focuses on click
  for: string
  // Mandatory field: a red asterisk after the text
  isRequired?: boolean
}>()

defineSlots<{
  default: () => unknown
}>()
</script>

<template>
  <label
    :data-component-name="COMPONENT_NAME"
    :for="props.for"
    class="mb-2 block w-fit cursor-pointer text-[15px] leading-5 font-semibold text-foreground"
  >
    <slot />
    <!-- Decorative: screen readers get aria-required on the control itself -->
    <span v-if="props.isRequired" class="ml-0.5 text-danger" aria-hidden="true"
      >*</span
    >
  </label>
</template>
