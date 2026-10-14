<script setup lang="ts">
import { computed, useAttrs, useId, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import AppValidationContainer from '@/components/app/forms/AppValidationContainer.vue'
import IconClose from '@/components/svg/IconClose.vue'
import inputSizes, { type InputSize } from '@/constants/inputSizes'
import type { ValidationRule } from '@/types/validation'

const COMPONENT_NAME = 'AppInput'

defineOptions({ name: COMPONENT_NAME, inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    size?: InputSize
    label?: string
    name?: string
    // Own rules from @/helpers/validationRules, checked in order
    rules?: ValidationRule[]
    placeholder?: string
    clearable?: boolean
    disabled?: boolean
  }>(),
  {
    size: inputSizes.MD,
    label: undefined,
    name: undefined,
    rules: undefined,
    placeholder: undefined,
    clearable: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  clear: []
}>()

const model = defineModel<string>({ default: '' })

defineSlots<{
  prevIcon?: () => unknown
  afterIcon?: () => unknown
}>()

const SIZE_CLASSES: Record<InputSize, string> = {
  [inputSizes.SM]: 'h-8 gap-2 px-2.5 text-sm [&_svg]:size-3.5',
  [inputSizes.MD]: 'h-10 gap-2 px-3 text-sm [&_svg]:size-4',
  [inputSizes.LG]: 'h-11 gap-3 px-4 text-base [&_svg]:size-4',
}

const WRAPPER_ATTRS = ['class', 'style']

const { t } = useI18n()
const attrs = useAttrs()
const fallbackId = useId()
const input = useTemplateRef<HTMLInputElement>('input')

const ariaLabel = computed<string | undefined>(
  () => props.label ?? props.placeholder,
)

// Browser suggestions are off by default; a parent's autocomplete="email" etc. overrides it
const getInputAttrs = (): Record<string, unknown> => {
  return {
    autocomplete: 'off',
    ...Object.fromEntries(
      Object.entries(attrs).filter(([name]) => !WRAPPER_ATTRS.includes(name)),
    ),
  }
}

const getInputId = (): string => {
  return typeof attrs.id === 'string' ? attrs.id : fallbackId
}

const clear = (): void => {
  model.value = ''
  emit('clear')
  input.value?.focus()
}
</script>

<template>
  <AppValidationContainer
    v-slot="{ invalid, errorId, onBlur }"
    :name="props.name"
    :rules="props.rules"
    :label="ariaLabel"
    :value="model"
    :class="attrs.class"
    :style="attrs.style"
  >
    <div :data-component-name="COMPONENT_NAME">
      <label
        v-if="props.label"
        :for="getInputId()"
        class="mb-2 block w-fit cursor-pointer text-[15px] leading-5 font-semibold text-foreground"
      >
        {{ props.label }}
      </label>

      <label
        :class="[
          SIZE_CLASSES[props.size],
          props.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-text',
          invalid
            ? 'border-danger focus-within:border-danger focus-within:ring-danger/20'
            : 'border-border focus-within:border-primary focus-within:ring-primary/20',
        ]"
        class="flex w-full items-center rounded-lg border bg-background text-foreground transition-colors focus-within:ring-3"
      >
        <span
          v-if="$slots.prevIcon"
          class="flex shrink-0 items-center text-muted"
        >
          <slot name="prevIcon" />
        </span>

        <input
          v-bind="getInputAttrs()"
          :id="getInputId()"
          ref="input"
          v-model="model"
          :name="props.name"
          :placeholder="props.placeholder ?? props.label"
          :aria-label="ariaLabel"
          :aria-invalid="invalid || undefined"
          :aria-describedby="errorId"
          :disabled="props.disabled"
          class="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:appearance-none"
          @blur="onBlur"
        />

        <button
          v-if="props.clearable && model && !props.disabled"
          type="button"
          class="flex shrink-0 cursor-pointer items-center rounded text-muted outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
          :aria-label="t('common.clear')"
          @click="clear"
        >
          <IconClose />
        </button>

        <span
          v-if="$slots.afterIcon"
          class="flex shrink-0 items-center text-muted"
        >
          <slot name="afterIcon" />
        </span>
      </label>
    </div>
  </AppValidationContainer>
</template>
