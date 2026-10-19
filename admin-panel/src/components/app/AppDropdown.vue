<script setup lang="ts" generic="TKey extends string, TPayload = undefined">
import {
  camelize,
  computed,
  toHandlerKey,
  useAttrs,
  useId,
  useTemplateRef,
} from 'vue'
import IconDots from '@/components/svg/IconDots.vue'
import { useFloatingMenu } from '@/use/useFloatingMenu'
import type { AppDropdownItem } from '@/types/dropdown'

const COMPONENT_NAME = 'AppDropdown'

// @edit, @delete… are item handlers, not DOM listeners: they must not land on the root
defineOptions({ name: COMPONENT_NAME, inheritAttrs: false })

const props = defineProps<{
  items: AppDropdownItem<TKey>[]
  // Accessible name of the icon-only trigger, e.g. t('…actions')
  label: string
  // Passed to the item handler: @edit="goToEdit" → goToEdit(payload)
  payload?: TPayload
}>()

const emit = defineEmits<{
  select: [key: TKey, payload: TPayload | undefined]
}>()

const attrs = useAttrs()

// Everything but the item handlers (class, data-*…) goes to the root as usual
const rootAttrs = computed<Record<string, unknown>>(() => {
  return Object.fromEntries(
    Object.entries(attrs).filter(([name]) => {
      return !/^on[A-Z]/.test(name)
    }),
  )
})

const visibleItems = computed<AppDropdownItem<TKey>[]>(() =>
  props.items.filter((item) => item.isShow !== false),
)

const menuId = useId()
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const menu = useTemplateRef<HTMLElement>('menu')
const arrowElement = useTemplateRef<HTMLElement>('arrow')

const { isOpen, position, isAbove, arrowStyles, open, close, onMenuKeydown } =
  useFloatingMenu({
    trigger,
    menu,
    arrowElement,
    align: 'right',
    itemSelector: '[role="menuitem"]',
  })

const toggle = async (): Promise<void> => {
  if (isOpen.value) {
    close()
    return
  }

  await open()
}

const hasDividerBefore = (index: number): boolean => {
  return (
    index > 0 &&
    Boolean(visibleItems.value[index]?.danger) &&
    !visibleItems.value[index - 1]?.danger
  )
}

// Item "edit" → its own listener @edit; @select gets every item
const select = (key: TKey): void => {
  const handler = attrs[toHandlerKey(camelize(key))]

  if (typeof handler === 'function') handler(props.payload)

  emit('select', key, props.payload)
  close(true)
}
</script>

<template>
  <div
    v-if="visibleItems.length"
    v-bind="rootAttrs"
    :data-component-name="COMPONENT_NAME"
    class="inline-flex"
  >
    <button
      ref="trigger"
      type="button"
      class="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors outline-none hover:bg-nav-hover hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/30 [&_svg]:size-4"
      :class="{ 'bg-nav-hover text-foreground ring-3 ring-primary/20': isOpen }"
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
          class="fixed z-50 min-w-48 rounded-xl border border-border bg-background p-1.5 text-foreground shadow-lg shadow-black/5"
          :class="isAbove ? 'origin-bottom-right' : 'origin-top-right'"
          @keydown="onMenuKeydown"
        >
          <!-- Arrow: a turned square; only the two sides outside the menu have a border -->
          <span
            ref="arrow"
            class="absolute size-2.5 rotate-45 border-border bg-background"
            :class="isAbove ? 'border-r border-b' : 'border-t border-l'"
            :style="arrowStyles"
            aria-hidden="true"
          />
          <template v-for="(item, index) in visibleItems" :key="item.key">
            <div
              v-if="hasDividerBefore(index)"
              role="separator"
              class="-mx-1.5 my-1.5 h-px bg-border"
            />
            <button
              type="button"
              role="menuitem"
              tabindex="-1"
              class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm whitespace-nowrap transition-colors outline-none"
              :class="
                item.danger
                  ? 'text-danger hover:bg-danger/10 focus-visible:bg-danger/10'
                  : 'hover:bg-nav-hover focus-visible:bg-nav-hover'
              "
              @click="select(item.key)"
            >
              <component
                :is="item.icon"
                v-if="item.icon"
                class="size-4 shrink-0"
                :class="{ 'text-muted': !item.danger }"
              />
              {{ item.label }}
            </button>
          </template>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
