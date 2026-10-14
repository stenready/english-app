import {
  arrow,
  autoUpdate,
  flip,
  hide,
  offset,
  shift,
  size,
  useFloating,
} from '@floating-ui/vue'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
  type CSSProperties,
  type Ref,
} from 'vue'

const MENU_OFFSET = 4
const ARROW_OFFSET = 10
const ARROW_HALF_SIZE = 5
const ARROW_PADDING = 8
const VIEWPORT_MARGIN = 8

export type FloatingAlign = 'left' | 'right'

interface FloatingMenuOptions {
  trigger: Readonly<Ref<HTMLElement | null>>
  menu: Readonly<Ref<HTMLElement | null>>
  arrowElement?: Readonly<Ref<HTMLElement | null>>
  align: FloatingAlign
  itemSelector: string
}

export const useFloatingMenu = ({
  trigger,
  menu,
  arrowElement,
  align,
  itemSelector,
}: FloatingMenuOptions) => {
  const isOpen = ref(false)

  const {
    floatingStyles: position,
    middlewareData,
    placement,
  } = useFloating(trigger, menu, {
    open: isOpen,
    strategy: 'fixed',
    placement: align === 'right' ? 'bottom-end' : 'bottom-start',
    transform: false,
    middleware: [
      offset(arrowElement ? ARROW_OFFSET : MENU_OFFSET),
      flip({ padding: VIEWPORT_MARGIN }),
      shift({ padding: VIEWPORT_MARGIN }),
      ...(align === 'left'
        ? [
            size({
              apply: ({ rects, elements }) => {
                elements.floating.style.minWidth = `${rects.reference.width}px`
              },
            }),
          ]
        : []),
      ...(arrowElement
        ? [arrow({ element: arrowElement, padding: ARROW_PADDING })]
        : []),
      hide(),
    ],
    whileElementsMounted: autoUpdate,
  })

  const isAbove = computed<boolean>(() => {
    return placement.value.startsWith('top')
  })

  const arrowStyles = computed<CSSProperties>(() => {
    const x = middlewareData.value.arrow?.x

    return {
      left: x === undefined ? undefined : `${x}px`,
      [isAbove.value ? 'bottom' : 'top']: `-${ARROW_HALF_SIZE}px`,
    }
  })

  const getItems = (): HTMLElement[] => {
    return Array.from(
      menu.value?.querySelectorAll<HTMLElement>(itemSelector) ?? [],
    )
  }

  const focusAt = (index: number): void => {
    const items = getItems()

    items.at(index % items.length)?.focus({ preventScroll: true })
  }

  const getFocusedIndex = (): number => {
    return getItems().findIndex((item) => item === document.activeElement)
  }

  // Focuses the item at focusIndex once the menu is rendered
  const open = async (focusIndex = 0): Promise<void> => {
    isOpen.value = true
    await nextTick()
    focusAt(focusIndex)
  }

  const close = (returnFocus = false): void => {
    isOpen.value = false

    if (returnFocus) trigger.value?.focus()
  }

  const onMenuKeydown = (event: KeyboardEvent): void => {
    const handlers: Record<string, () => void> = {
      ArrowDown: () => focusAt(getFocusedIndex() + 1),
      ArrowUp: () => focusAt(getFocusedIndex() - 1),
      Home: () => focusAt(0),
      End: () => focusAt(-1),
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

  watch(
    () => middlewareData.value.hide?.referenceHidden,
    (isTriggerHidden) => {
      if (isTriggerHidden) {
        close()
      }
    },
  )

  watch(isOpen, (value) => {
    if (value) {
      document.addEventListener('pointerdown', onDocumentPointerdown)
    } else {
      document.removeEventListener('pointerdown', onDocumentPointerdown)
    }
  })

  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onDocumentPointerdown)
  })

  return {
    isOpen,
    position,
    isAbove,
    arrowStyles,
    open,
    close,
    onMenuKeydown,
  }
}
