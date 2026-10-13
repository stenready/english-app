<script setup lang="ts" generic="TKey extends string">
import {
  nextTick,
  onBeforeUnmount,
  ref,
  useId,
  useTemplateRef,
  watch,
  type CSSProperties,
} from 'vue'
import IconDots from '@/components/svg/IconDots.vue'
import type { AppDropdownItem } from '@/types/dropdown'

const COMPONENT_NAME = 'AppDropdown'

defineOptions({ name: COMPONENT_NAME })

const props = defineProps<{
  items: AppDropdownItem<TKey>[]
  // Accessible name of the icon-only trigger, e.g. t('…actions')
  label: string
}>()

const emit = defineEmits<{
  select: [key: TKey]
}>()

const MENU_OFFSET = 4
const VIEWPORT_MARGIN = 8
const STEP_NEXT = 1
const STEP_PREV = -1

const menuId = useId()
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const menu = useTemplateRef<HTMLElement>('menu')

const isOpen = ref(false)
const position = ref<CSSProperties>({})

const toPx = (value: number): string => `${value}px`

const getItemButtons = (): HTMLButtonElement[] =>
  Array.from(
    menu.value?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [],
  )

// The menu is teleported to <body> with fixed position, so a scrolling table
// can't clip it. Opens below the trigger, or above when there is no room
const updatePosition = (): void => {
  if (!trigger.value || !menu.value) return

  const triggerRect = trigger.value.getBoundingClientRect()
  const menuHeight = menu.value.offsetHeight
  const fitsBelow =
    triggerRect.bottom + MENU_OFFSET + menuHeight <=
    window.innerHeight - VIEWPORT_MARGIN

  position.value = {
    right: toPx(window.innerWidth - triggerRect.right),
    top: toPx(
      fitsBelow
        ? triggerRect.bottom + MENU_OFFSET
        : triggerRect.top - MENU_OFFSET - menuHeight,
    ),
  }
}

const open = async (): Promise<void> => {
  isOpen.value = true
  await nextTick()
  updatePosition()
  getItemButtons()[0]?.focus({ preventScroll: true })
}

const close = (returnFocus = false): void => {
  isOpen.value = false

  if (returnFocus) trigger.value?.focus()
}

const toggle = (): void => {
  if (isOpen.value) {
    close()
  } else {
    open()
  }
}

const select = (key: TKey): void => {
  emit('select', key)
  close(true)
}

const moveFocus = (step: number): void => {
  const buttons = getItemButtons()
  const current = buttons.findIndex(
    (button) => button === document.activeElement,
  )
  const next = (current + step + buttons.length) % buttons.length

  buttons[next]?.focus()
}

const focusEdge = (isLast: boolean): void => {
  const buttons = getItemButtons()

  buttons[isLast ? buttons.length - 1 : 0]?.focus()
}

const onMenuKeydown = (event: KeyboardEvent): void => {
  const handlers: Record<string, () => void> = {
    ArrowDown: () => moveFocus(STEP_NEXT),
    ArrowUp: () => moveFocus(STEP_PREV),
    Home: () => focusEdge(false),
    End: () => focusEdge(true),
    Escape: () => close(true),
    Tab: () => close(),
  }
  const handler = handlers[event.key]

  if (!handler) return

  // Tab keeps its default: focus moves on to the next element
  if (event.key !== 'Tab') event.preventDefault()
  handler()
}

const onDocumentPointerdown = (event: PointerEvent): void => {
  const target = event.target as Node

  if (trigger.value?.contains(target) || menu.value?.contains(target)) return
  close()
}

// A fixed menu would drift away from its trigger on scroll/resize: close it
const onViewportChange = (): void => close()

// Scroll events from a scroll that happened before opening (auto-scroll to the
// trigger, trackpad inertia) arrive in the next frame and would close the menu
// at once. Scroll events are dispatched before rAF callbacks, so listen from there
let frameId = 0

const listenViewport = (): void => {
  window.addEventListener('scroll', onViewportChange, true)
  window.addEventListener('resize', onViewportChange)
}

const addListeners = (): void => {
  document.addEventListener('pointerdown', onDocumentPointerdown)
  frameId = requestAnimationFrame(listenViewport)
}

const removeListeners = (): void => {
  cancelAnimationFrame(frameId)
  document.removeEventListener('pointerdown', onDocumentPointerdown)
  window.removeEventListener('scroll', onViewportChange, true)
  window.removeEventListener('resize', onViewportChange)
}

watch(isOpen, (value) => (value ? addListeners() : removeListeners()))

onBeforeUnmount(removeListeners)
</script>

<template>
  <div :data-component-name="COMPONENT_NAME" class="inline-flex">
    <button
      ref="trigger"
      type="button"
      class="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted transition-colors outline-none hover:bg-nav-hover hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/30 [&_svg]:size-4"
      :class="{ 'bg-nav-hover text-foreground': isOpen }"
      :aria-label="props.label"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      :aria-controls="isOpen ? menuId : undefined"
      @click="toggle"
    >
      <IconDots />
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out motion-reduce:transition-none"
        enter-from-class="scale-95 opacity-0"
        leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
        leave-to-class="scale-95 opacity-0"
      >
        <div
          v-if="isOpen"
          :id="menuId"
          ref="menu"
          role="menu"
          :aria-label="props.label"
          :style="position"
          class="fixed z-50 min-w-44 origin-top-right rounded-lg border border-border bg-background p-1 text-foreground shadow-lg"
          @keydown="onMenuKeydown"
        >
          <button
            v-for="item in props.items"
            :key="item.key"
            type="button"
            role="menuitem"
            tabindex="-1"
            class="flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-left text-sm outline-none hover:bg-nav-hover focus:bg-nav-hover"
            :class="{ 'text-danger': item.danger }"
            @click="select(item.key)"
          >
            {{ item.label }}
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
