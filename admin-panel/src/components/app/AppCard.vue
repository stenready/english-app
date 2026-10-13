<script setup lang="ts">
import cardPaddings, { type CardPadding } from '@/constants/cardPaddings'

const COMPONENT_NAME = 'AppCard'

defineOptions({ name: COMPONENT_NAME })

// Page content wrapper: same padding everywhere, optional title / description
const props = withDefaults(
  defineProps<{
    padding?: CardPadding
    title?: string
    description?: string
  }>(),
  {
    padding: cardPaddings.MD,
    title: undefined,
    description: undefined,
  },
)

defineSlots<{
  default?: () => unknown
  icon?: () => unknown
  // Buttons on the right of the header
  actions?: () => unknown
}>()

const PADDING_CLASSES: Record<CardPadding, string> = {
  [cardPaddings.NONE]: '',
  [cardPaddings.SM]: 'p-4',
  [cardPaddings.MD]: 'p-6',
  [cardPaddings.LG]: 'p-8',
}
</script>

<template>
  <div
    :data-component-name="COMPONENT_NAME"
    :class="PADDING_CLASSES[props.padding]"
  >
    <header
      v-if="props.title || props.description || $slots.actions"
      class="mb-6 flex items-center gap-4 border-b border-border pb-5"
    >
      <span
        v-if="$slots.icon"
        class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5"
      >
        <slot name="icon" />
      </span>

      <div class="min-w-0">
        <h1
          v-if="props.title"
          class="text-xl leading-7 font-semibold tracking-tight"
        >
          {{ props.title }}
        </h1>
        <p v-if="props.description" class="text-sm text-muted">
          {{ props.description }}
        </p>
      </div>

      <div
        v-if="$slots.actions"
        class="ml-auto flex shrink-0 items-center gap-2"
      >
        <slot name="actions" />
      </div>
    </header>

    <slot />
  </div>
</template>
