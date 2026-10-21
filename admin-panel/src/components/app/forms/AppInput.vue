<script setup lang="ts">
import { computed, ref, useAttrs, useId, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import AppFieldLabel from '@/components/app/forms/AppFieldLabel.vue'
import AppValidationContainer from '@/components/app/forms/AppValidationContainer.vue'
import IconClose from '@/components/svg/IconClose.vue'
import IconEye from '@/components/svg/IconEye.vue'
import IconEyeOff from '@/components/svg/IconEyeOff.vue'
import inputSizes, { type InputSize } from '@/constants/inputSizes'
import { hasRequiredRule } from '@/helpers/validationRules'
import type { ValidationRule } from '@/types/validation'

const COMPONENT_NAME = 'AppInput'

defineOptions({ name: COMPONENT_NAME, inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    // Unique on the page: data-name for tests and devtools. Not the form field name
    dataName: string
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
const PASSWORD_TYPE = 'password'
const TEXT_TYPE = 'text'

const { t } = useI18n()
const attrs = useAttrs()
const fallbackId = useId()
const input = useTemplateRef<HTMLInputElement>('input')

// type="password": the eye button shows the typed text
const isPasswordShown = ref(false)

const isRequired = computed<boolean>(() => {
  return hasRequiredRule(props.rules)
})

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

// attrs aren't reactive: functions, not computed, so they're read on every render
const isPassword = (): boolean => {
  return attrs.type === PASSWORD_TYPE
}

const getInputType = (): string | undefined => {
  if (isPassword() && isPasswordShown.value) return TEXT_TYPE

  return typeof attrs.type === 'string' ? attrs.type : undefined
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
    <div :data-component-name="COMPONENT_NAME" :data-name="props.dataName">
      <AppFieldLabel
        v-if="props.label"
        :for="getInputId()"
        :is-required="isRequired"
      >
        {{ props.label }}
      </AppFieldLabel>

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
          :type="getInputType()"
          :name="props.name"
          :placeholder="props.placeholder ?? props.label"
          :aria-label="ariaLabel"
          :aria-invalid="invalid || undefined"
          :aria-required="isRequired || undefined"
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

        <!-- mousedown.prevent: the input keeps focus (and the caret) on a click -->
        <button
          v-if="isPassword() && !props.disabled"
          type="button"
          class="flex shrink-0 cursor-pointer items-center rounded text-muted outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
          :aria-label="
            isPasswordShown
              ? t('common.hidePassword')
              : t('common.showPassword')
          "
          :aria-pressed="isPasswordShown"
          @mousedown.prevent
          @click="isPasswordShown = !isPasswordShown"
        >
          <IconEyeOff v-if="isPasswordShown" />
          <IconEye v-else />
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
