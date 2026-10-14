<script setup lang="ts" generic="TValue">
import { computed, useId, watch } from 'vue'
import { useField } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import type { ValidationRule } from '@/types/validation'

const COMPONENT_NAME = 'AppValidationContainer'

defineOptions({ name: COMPONENT_NAME })

const props = defineProps<{
  // Field path in the parent form (useForm). Without a name the field is
  // validated on its own and doesn't get into the form values
  name?: string
  // Checked in order, the first error is shown
  rules?: ValidationRule<TValue>[]
  // Field name in error messages
  label?: string
  value: TValue
}>()

defineSlots<{
  default: (props: {
    invalid: boolean
    errorId: string | undefined
    onBlur: () => void
  }) => unknown
}>()

const errorId = useId()
const fallbackName = useId()
const { locale } = useI18n()

const { errorMessage, handleBlur, handleChange, validate } = useField<TValue>(
  () => props.name ?? fallbackName,
  computed(() => props.rules),
  {
    label: () => props.label,
    initialValue: props.value,
    // Not part of useForm without an explicit name (no "v-3" keys in values)
    controlled: Boolean(props.name),
  },
)

watch(
  () => props.value,
  (value) => handleChange(value),
)

watch(locale, () => {
  if (errorMessage.value) {
    validate()
  }
})

const slotProps = computed(() => ({
  invalid: Boolean(errorMessage.value),
  errorId: errorMessage.value ? errorId : undefined,
  onBlur: () => handleBlur(undefined, true),
}))
</script>

<template>
  <div :data-component-name="COMPONENT_NAME">
    <slot v-bind="slotProps" />

    <Transition
      enter-active-class="transition-all duration-250 ease-out motion-reduce:transition-none"
      enter-from-class="grid-rows-[0fr] -translate-y-1 opacity-0"
      enter-to-class="grid-rows-[1fr]"
      leave-from-class="grid-rows-[1fr]"
      leave-active-class="transition-all duration-200 ease-in motion-reduce:transition-none"
      leave-to-class="grid-rows-[0fr] -translate-y-1 opacity-0"
    >
      <div v-if="errorMessage" class="grid">
        <div class="min-h-0 overflow-hidden">
          <p :id="errorId" class="pt-1.5 text-sm text-danger" role="alert">
            {{ errorMessage }}
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>
