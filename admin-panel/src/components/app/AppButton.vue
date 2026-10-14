<script setup lang="ts">
import buttonSizes, { type ButtonSize } from '@/constants/buttonSizes'
import buttonVariants, { type ButtonVariant } from '@/constants/buttonVariants'

const COMPONENT_NAME = 'AppButton'

defineOptions({ name: COMPONENT_NAME })

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    // Native default is "submit": any button inside a form would submit it
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    variant: buttonVariants.PRIMARY,
    size: buttonSizes.MD,
    type: 'button',
    disabled: false,
  },
)

defineSlots<{
  default?: () => unknown
}>()

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  [buttonVariants.PRIMARY]:
    'border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
  [buttonVariants.INFO]:
    'border-transparent bg-info text-info-foreground hover:bg-info/90',
  [buttonVariants.WARNING]:
    'border-transparent bg-warning text-warning-foreground hover:bg-warning/90',
  [buttonVariants.OUTLINE]:
    'border-border bg-transparent text-foreground hover:bg-nav-hover',
  [buttonVariants.OUTLINE_PRIMARY]:
    'border-primary bg-transparent text-primary hover:bg-primary/10',
  [buttonVariants.OUTLINE_INFO]:
    'border-info bg-transparent text-info hover:bg-info/10',
  [buttonVariants.OUTLINE_WARNING]:
    'border-warning bg-transparent text-warning hover:bg-warning/10',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  [buttonSizes.SM]: 'h-8 gap-1.5 px-3 text-sm [&_svg]:size-3.5',
  [buttonSizes.MD]: 'h-10 gap-2 px-4 text-sm [&_svg]:size-4',
  [buttonSizes.LG]: 'h-11 gap-2 px-5 text-base [&_svg]:size-4',
}
</script>

<template>
  <button
    :data-component-name="COMPONENT_NAME"
    :type="props.type"
    :disabled="props.disabled"
    :class="[VARIANT_CLASSES[props.variant], SIZE_CLASSES[props.size]]"
    class="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
  >
    <slot />
  </button>
</template>
