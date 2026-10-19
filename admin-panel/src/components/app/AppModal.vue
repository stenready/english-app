<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  useTemplateRef,
  watch,
} from 'vue'
import { useI18n } from 'vue-i18n'
import IconClose from '@/components/svg/IconClose.vue'
import modalPositions, { type ModalPosition } from '@/constants/modalPositions'
import modalSizes, { type ModalSize } from '@/constants/modalSizes'

const COMPONENT_NAME = 'AppModal'

defineOptions({ name: COMPONENT_NAME })

const SIZE_CLASSES: Record<ModalSize, string> = {
  [modalSizes.SM]: 'max-w-sm',
  [modalSizes.MD]: 'max-w-lg',
  [modalSizes.LG]: 'max-w-2xl',
  [modalSizes.XL]: 'max-w-5xl',
}

// Wrapper alignment + the panel height that still fits under that padding
const POSITION_CLASSES: Record<
  ModalPosition,
  { wrapper: string; panel: string }
> = {
  [modalPositions.CENTER]: {
    wrapper: 'items-center',
    panel: 'max-h-[calc(100dvh-2rem)]',
  },
  [modalPositions.TOP]: {
    wrapper: 'items-start pt-[10dvh]',
    panel: 'max-h-[calc(90dvh-1rem)]',
  },
}

// The page behind must not scroll while the modal is open
const SCROLL_LOCK_CLASS = 'overflow-hidden'

const props = withDefaults(
  defineProps<{
    // Rendered as data-modal-name: finds a particular modal in tests / devtools
    name?: string
    title?: string
    description?: string
    size?: ModalSize
    position?: ModalPosition
    // A click outside the panel closes the modal (Escape always does)
    closeOnBackdrop?: boolean
  }>(),
  {
    name: undefined,
    title: undefined,
    description: undefined,
    size: modalSizes.MD,
    position: modalPositions.CENTER,
    closeOnBackdrop: true,
  },
)

defineSlots<{
  // Replaces the title and description (the ✕ button stays)
  header?: () => unknown
  default?: () => unknown
  footer?: () => unknown
}>()

const emit = defineEmits<{
  // After the closing animation: e.g. reset a form here
  closed: []
}>()

// v-model: true opens, false closes (with the animation)
const isOpen = defineModel<boolean>({ default: false })

const { t } = useI18n()
const titleId = useId()
const descriptionId = useId()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const panel = useTemplateRef<HTMLElement>('panel')
const closeButton = useTemplateRef<HTMLButtonElement>('closeButton')

// The <dialog> stays in the top layer until the leave animation ends
const isContentShown = ref(false)

const lockScroll = (isLocked: boolean): void => {
  document.documentElement.classList.toggle(SCROLL_LOCK_CLASS, isLocked)
}

// Native <dialog>: top layer above everything, focus moves inside and
// returns to the opener on close, the page behind can't be clicked or tabbed into
const show = async (): Promise<void> => {
  dialog.value?.showModal()
  lockScroll(true)
  isContentShown.value = true

  // showModal() focused the still empty dialog: the content renders a tick later.
  // An element with autofocus (e.g. the first input of a form) wins over the ✕ button
  await nextTick()
  const autofocusElement =
    panel.value?.querySelector<HTMLElement>('[autofocus]')
  const focusTarget = autofocusElement ?? closeButton.value

  focusTarget?.focus()
}

// Hides the content first; the <dialog> closes after its leave animation
watch(
  isOpen,
  (value) => {
    if (value) {
      show()
    } else {
      isContentShown.value = false
    }
  },
  { flush: 'post' },
)

// Opened from the start (v-model already true)
onMounted(() => {
  if (isOpen.value) show()
})

const close = (): void => {
  isOpen.value = false
}

// Escape: the browser would close the dialog at once, without the animation
const onCancel = (event: Event): void => {
  event.preventDefault()
  close()
}

const onBackdropClick = (): void => {
  if (props.closeOnBackdrop) close()
}

const onAfterLeave = (): void => {
  dialog.value?.close()
  lockScroll(false)
  emit('closed')
}

onBeforeUnmount(() => {
  lockScroll(false)
})
</script>

<template>
  <!-- Full-screen and transparent: the backdrop and the panel inside are animated by Vue -->
  <dialog
    ref="dialog"
    :data-component-name="COMPONENT_NAME"
    :data-modal-name="props.name"
    :aria-labelledby="props.title || $slots.header ? titleId : undefined"
    :aria-describedby="props.description ? descriptionId : undefined"
    class="m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-transparent"
    @cancel="onCancel"
  >
    <!-- Material-style scrim: a plain fade, no blur -->
    <Transition
      enter-active-class="transition-opacity duration-225 ease-[cubic-bezier(0,0,0.2,1)] motion-reduce:transition-none"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150 ease-[cubic-bezier(0.4,0,1,1)] motion-reduce:transition-none"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isContentShown"
        data-name="backdrop"
        class="fixed inset-0 bg-black/30"
        aria-hidden="true"
        @click="onBackdropClick"
      />
    </Transition>

    <div
      class="pointer-events-none fixed inset-0 flex justify-center p-4"
      :class="POSITION_CLASSES[props.position].wrapper"
    >
      <!-- Material-style (like Vuetify's dialog): grows from 90% and fades in,
           decelerating; leaves the same way, accelerating -->
      <Transition
        enter-active-class="transition duration-225 ease-[cubic-bezier(0,0,0.2,1)] motion-reduce:transition-none"
        enter-from-class="scale-90 opacity-0"
        leave-active-class="transition duration-150 ease-[cubic-bezier(0.4,0,1,1)] motion-reduce:transition-none"
        leave-to-class="scale-90 opacity-0"
        @after-leave="onAfterLeave"
      >
        <div
          v-if="isContentShown"
          ref="panel"
          data-name="panel"
          class="pointer-events-auto flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl shadow-black/10"
          :class="[
            SIZE_CLASSES[props.size],
            POSITION_CLASSES[props.position].panel,
          ]"
        >
          <header
            data-name="header"
            class="flex shrink-0 items-start gap-4 px-6 pt-5 pb-4"
          >
            <div
              :id="$slots.header ? titleId : undefined"
              class="min-w-0 flex-1"
            >
              <slot name="header">
                <h2
                  v-if="props.title"
                  :id="titleId"
                  class="text-lg leading-7 font-semibold tracking-tight"
                >
                  {{ props.title }}
                </h2>
                <p
                  v-if="props.description"
                  :id="descriptionId"
                  class="mt-0.5 text-sm text-muted"
                >
                  {{ props.description }}
                </p>
              </slot>
            </div>

            <button
              ref="closeButton"
              type="button"
              class="-mr-2 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors outline-none hover:bg-nav-hover hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/30 [&_svg]:size-4"
              :aria-label="t('common.close')"
              @click="close"
            >
              <IconClose />
            </button>
          </header>

          <!-- Only the body scrolls: header and footer stay in place -->
          <div
            v-if="$slots.default"
            data-name="body"
            class="min-h-0 flex-1 overflow-y-auto px-6 pb-6"
          >
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            data-name="footer"
            class="flex shrink-0 items-center justify-end gap-3 border-t border-border bg-surface px-6 py-4"
          >
            <slot name="footer" />
          </footer>
        </div>
      </Transition>
    </div>
  </dialog>
</template>
