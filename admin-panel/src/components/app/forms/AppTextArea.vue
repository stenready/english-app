<script setup lang="ts">
import { computed, useAttrs, useId } from 'vue'
import AppFieldLabel from '@/components/app/forms/AppFieldLabel.vue'
import AppValidationContainer from '@/components/app/forms/AppValidationContainer.vue'
import { hasRequiredRule } from '@/helpers/validationRules'
import type { ValidationRule } from '@/types/validation'

const COMPONENT_NAME = 'AppTextArea'

defineOptions({ name: COMPONENT_NAME, inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    // Unique on the page: data-name for tests and devtools. Not the form field name
    dataName: string
    label?: string
    name?: string
    // Own rules from @/helpers/validationRules, checked in order
    rules?: ValidationRule[]
    placeholder?: string
    // Visible lines; the user can still resize it vertically
    rows?: number
    disabled?: boolean
  }>(),
  {
    label: undefined,
    name: undefined,
    rules: undefined,
    placeholder: undefined,
    rows: 4,
    disabled: false,
  },
)

const model = defineModel<string>({ default: '' })

const WRAPPER_ATTRS = ['class', 'style']

const attrs = useAttrs()
const fallbackId = useId()

const isRequired = computed<boolean>(() => {
  return hasRequiredRule(props.rules)
})

const ariaLabel = computed<string | undefined>(
  () => props.label ?? props.placeholder,
)

// class / style go to the wrapper, the rest (autofocus, maxlength…) to the <textarea>
const getTextareaAttrs = (): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(attrs).filter(([name]) => !WRAPPER_ATTRS.includes(name)),
  )
}

const getTextareaId = (): string => {
  return typeof attrs.id === 'string' ? attrs.id : fallbackId
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
        :for="getTextareaId()"
        :is-required="isRequired"
      >
        {{ props.label }}
      </AppFieldLabel>

      <textarea
        v-bind="getTextareaAttrs()"
        :id="getTextareaId()"
        v-model="model"
        :name="props.name"
        :rows="props.rows"
        :placeholder="props.placeholder ?? props.label"
        :aria-label="ariaLabel"
        :aria-invalid="invalid || undefined"
        :aria-required="isRequired || undefined"
        :aria-describedby="errorId"
        :disabled="props.disabled"
        :class="
          invalid
            ? 'border-danger focus:border-danger focus:ring-danger/20'
            : 'border-border focus:border-primary focus:ring-primary/20'
        "
        class="block w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm text-foreground transition-colors outline-none placeholder:text-muted focus:ring-3 disabled:cursor-not-allowed disabled:opacity-60"
        @blur="onBlur"
      />
    </div>
  </AppValidationContainer>
</template>
