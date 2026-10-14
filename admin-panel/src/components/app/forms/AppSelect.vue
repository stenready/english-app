<script setup lang="ts" generic="TValue">
import { computed, useAttrs, useId, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import AppValidationContainer from '@/components/app/forms/AppValidationContainer.vue'
import IconCheck from '@/components/svg/IconCheck.vue'
import IconChevronDown from '@/components/svg/IconChevronDown.vue'
import IconClose from '@/components/svg/IconClose.vue'
import inputSizes, { type InputSize } from '@/constants/inputSizes'
import { useFloatingMenu } from '@/use/useFloatingMenu'
import type { AppSelectOption } from '@/types/select'
import type { ValidationRule } from '@/types/validation'

const COMPONENT_NAME = 'AppSelect'

// A choice input: same sizes, label, validation and v-model as AppInput.
// The value can be of any type, objects included (compared by valueKey)
defineOptions({ name: COMPONENT_NAME, inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    options: AppSelectOption<TValue>[]
    // Object values: the field that identifies them, e.g. 'id'.
    // Without it values are compared with ===
    valueKey?: keyof NonNullable<TValue>
    size?: InputSize
    label?: string
    name?: string
    // Own rules from @/helpers/validationRules, checked in order
    rules?: ValidationRule<TValue>[]
    // Shown while nothing is chosen (model is null)
    placeholder?: string
    // A "clear" button that sets the model to null
    clearable?: boolean
    disabled?: boolean
  }>(),
  {
    size: inputSizes.MD,
    label: undefined,
    name: undefined,
    rules: undefined,
    valueKey: undefined,
    placeholder: undefined,
    clearable: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  clear: []
}>()

const model = defineModel<TValue>({ required: true })

const SIZE_CLASSES: Record<InputSize, string> = {
  [inputSizes.SM]: 'h-8 gap-2 pl-2.5 pr-2 text-sm',
  [inputSizes.MD]: 'h-10 gap-2 pl-3 pr-2.5 text-sm',
  [inputSizes.LG]: 'h-11 gap-3 pl-4 pr-3 text-base',
}

// The clear button sits just left of the chevron:
// right = trigger's right padding + chevron (16px) + 6px gap
const CLEAR_POSITION_CLASSES: Record<InputSize, string> = {
  [inputSizes.SM]: 'right-7.5 [&_svg]:size-3.5',
  [inputSizes.MD]: 'right-8 [&_svg]:size-4',
  [inputSizes.LG]: 'right-9 [&_svg]:size-4',
}

// Room for the clear button so the text never runs under it
const CLEAR_SPACE_CLASS = 'pr-7'

// Keys on the closed trigger that open the list
const OPEN_KEYS = ['ArrowDown', 'ArrowUp', 'Enter', ' ']

const WRAPPER_ATTRS = ['class', 'style']

const { t } = useI18n()
const attrs = useAttrs()
const fallbackId = useId()
const listboxId = useId()
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const listbox = useTemplateRef<HTMLElement>('listbox')
const arrowElement = useTemplateRef<HTMLElement>('arrow')

const { isOpen, position, isAbove, arrowStyles, open, close, onMenuKeydown } =
  useFloatingMenu({
    trigger,
    menu: listbox,
    arrowElement,
    align: 'left',
    itemSelector: '[role="option"]',
  })

const isEmptyValue = (value: TValue): boolean => {
  return value === null || value === undefined
}

const isSameValue = (first: TValue, second: TValue): boolean => {
  if (!props.valueKey || isEmptyValue(first) || isEmptyValue(second)) {
    return first === second
  }

  const key = props.valueKey

  return (
    (first as NonNullable<TValue>)[key] === (second as NonNullable<TValue>)[key]
  )
}

const isSelected = (value: TValue): boolean => {
  return isSameValue(value, model.value)
}

const selectedLabel = computed<string | undefined>(
  () => props.options.find((option) => isSelected(option.value))?.label,
)

const isClearVisible = computed<boolean>(
  () => props.clearable && !isEmptyValue(model.value) && !props.disabled,
)

// Functions, not computed: attrs are not reactive
// class/style position the wrapper; the rest (aria-label, id…) goes to the trigger
const getTriggerAttrs = (): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(attrs).filter(([name]) => !WRAPPER_ATTRS.includes(name)),
  )
}

const getTriggerId = (): string => {
  return typeof attrs.id === 'string' ? attrs.id : fallbackId
}

// Accessible name: label, then placeholder, then an aria-label passed from above
const getAriaLabel = (): string | undefined => {
  const ariaLabel = attrs['aria-label']

  return (
    props.label ??
    props.placeholder ??
    (typeof ariaLabel === 'string' ? ariaLabel : undefined)
  )
}

// Opens with focus on the selected option, like a native select
const openList = async (): Promise<void> => {
  const selectedIndex = props.options.findIndex((option) =>
    isSelected(option.value),
  )

  await open(Math.max(selectedIndex, 0))
}

const toggle = (): void => {
  if (isOpen.value) {
    close()
  } else {
    openList()
  }
}

const onTriggerKeydown = (event: KeyboardEvent): void => {
  if (isOpen.value || !OPEN_KEYS.includes(event.key)) return

  event.preventDefault()
  openList()
}

const choose = (value: TValue): void => {
  model.value = value
  close(true)
}

const clear = (): void => {
  // The model type is the caller's: clearable means "this field may be null"
  model.value = null as TValue
  emit('clear')
  trigger.value?.focus()
}
</script>

<template>
  <AppValidationContainer
    v-slot="{ invalid, errorId, onBlur }"
    :name="props.name"
    :rules="props.rules"
    :label="props.label ?? props.placeholder"
    :value="model"
    :class="attrs.class"
    :style="attrs.style"
  >
    <div :data-component-name="COMPONENT_NAME">
      <label
        v-if="props.label"
        :for="getTriggerId()"
        class="mb-2 block w-fit cursor-pointer text-[15px] leading-5 font-semibold text-foreground"
      >
        {{ props.label }}
      </label>

      <div class="relative">
        <button
          v-bind="getTriggerAttrs()"
          :id="getTriggerId()"
          ref="trigger"
          type="button"
          :disabled="props.disabled"
          :class="[
            SIZE_CLASSES[props.size],
            invalid
              ? 'border-danger focus-visible:ring-danger/20'
              : 'border-border focus-visible:border-primary focus-visible:ring-primary/20',
            isOpen && !invalid && 'border-primary ring-3 ring-primary/20',
            isOpen && invalid && 'ring-3 ring-danger/20',
          ]"
          class="flex w-full cursor-pointer items-center justify-between rounded-lg border bg-background text-left text-foreground transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-60"
          aria-haspopup="listbox"
          :aria-expanded="isOpen"
          :aria-controls="isOpen ? listboxId : undefined"
          :aria-label="getAriaLabel()"
          :aria-invalid="invalid || undefined"
          :aria-describedby="errorId"
          @click="toggle"
          @keydown="onTriggerKeydown"
          @blur="!isOpen && onBlur()"
        >
          <span
            class="truncate"
            :class="[
              { 'text-muted': !selectedLabel },
              isClearVisible && CLEAR_SPACE_CLASS,
            ]"
          >
            {{ selectedLabel ?? props.placeholder }}
          </span>

          <IconChevronDown
            class="size-4 shrink-0 text-muted transition-transform duration-150"
            :class="{ 'rotate-180': isOpen }"
          />
        </button>

        <!-- Sibling of the trigger, not inside it: a button can't contain a button -->
        <button
          v-if="isClearVisible"
          type="button"
          class="absolute top-1/2 flex -translate-y-1/2 cursor-pointer items-center rounded text-muted outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
          :class="CLEAR_POSITION_CLASSES[props.size]"
          :aria-label="t('common.clear')"
          @click="clear"
        >
          <IconClose />
        </button>
      </div>

      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-150 ease-out motion-reduce:transition-none"
          enter-from-class="scale-95 opacity-0"
          leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
          leave-to-class="scale-95 opacity-0"
          @after-leave="onBlur"
        >
          <div
            v-if="isOpen"
            :id="listboxId"
            ref="listbox"
            role="listbox"
            :aria-label="getAriaLabel()"
            :style="position"
            class="fixed z-50 rounded-lg border border-border bg-background p-1 text-sm text-foreground shadow-lg"
            :class="isAbove ? 'origin-bottom' : 'origin-top'"
            @keydown="onMenuKeydown"
          >
            <!-- Arrow: a turned square; only the two sides outside the list have a border -->
            <span
              ref="arrow"
              class="absolute size-2.5 rotate-45 border-border bg-background"
              :class="isAbove ? 'border-r border-b' : 'border-t border-l'"
              :style="arrowStyles"
              aria-hidden="true"
            />
            <button
              v-for="(option, index) in props.options"
              :key="index"
              type="button"
              role="option"
              tabindex="-1"
              :aria-selected="isSelected(option.value)"
              class="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left whitespace-nowrap outline-none hover:bg-nav-hover focus-visible:bg-nav-hover"
              :class="{ 'font-medium text-primary': isSelected(option.value) }"
              @click="choose(option.value)"
            >
              {{ option.label }}
              <IconCheck
                class="size-4 shrink-0"
                :class="isSelected(option.value) ? 'visible' : 'invisible'"
              />
            </button>
          </div>
        </Transition>
      </Teleport>
    </div>
  </AppValidationContainer>
</template>
