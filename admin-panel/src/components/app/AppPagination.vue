<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import IconChevronDown from '@/components/svg/IconChevronDown.vue'
import IconChevronsLeft from '@/components/svg/IconChevronsLeft.vue'

const COMPONENT_NAME = 'AppPagination'

defineOptions({ name: COMPONENT_NAME })

const props = defineProps<{
  totalRows: number
  perPage: number
}>()

// 1-based, like BootstrapVue's b-pagination
const page = defineModel<number>('page', { required: true })

const FIRST_PAGE = 1
// Pages shown on each side of the current one: 1 … 4 [5] 6 … 12
const SIBLINGS = 1
// Up to this many pages everything is shown, no ellipsis
const MAX_PAGES_WITHOUT_ELLIPSIS = 7
// "…" replaces 2+ pages; a single hidden page is shown as its number instead
const MIN_HIDDEN_FOR_ELLIPSIS = 2
const ELLIPSIS_START = 'ellipsis-start'
const ELLIPSIS_END = 'ellipsis-end'

type PageItem = number | typeof ELLIPSIS_START | typeof ELLIPSIS_END

const { t } = useI18n()

const pageCount = computed<number>(() =>
  Math.max(FIRST_PAGE, Math.ceil(props.totalRows / props.perPage)),
)

const range = (from: number, to: number): number[] => {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index)
}

const items = computed<PageItem[]>(() => {
  const last = pageCount.value

  if (last <= MAX_PAGES_WITHOUT_ELLIPSIS) return range(FIRST_PAGE, last)

  // Keep the window the same width near the edges: 1 2 3 4 5 … 12
  const windowSize = SIBLINGS * 2 + 1
  const start = Math.min(
    Math.max(page.value - SIBLINGS, FIRST_PAGE + 1),
    last - windowSize,
  )
  const end = Math.max(
    Math.min(page.value + SIBLINGS, last - 1),
    FIRST_PAGE + windowSize,
  )

  return [
    FIRST_PAGE,
    ...(start > FIRST_PAGE + MIN_HIDDEN_FOR_ELLIPSIS
      ? [ELLIPSIS_START]
      : range(FIRST_PAGE + 1, start - 1)),
    ...range(start, end),
    ...(end < last - MIN_HIDDEN_FOR_ELLIPSIS
      ? [ELLIPSIS_END]
      : range(end + 1, last - 1)),
    last,
  ] as PageItem[]
})

const goTo = (target: number): void => {
  page.value = Math.min(Math.max(target, FIRST_PAGE), pageCount.value)
}

// Same look as our controls: 40px, bordered, rounded-lg (AppSelect md, AppButton outline)
const BUTTON_CLASS =
  'flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40'

const ARROW_CLASS =
  'border-border text-muted enabled:hover:bg-nav-hover enabled:hover:text-foreground'

const PAGE_CLASS = 'border-border text-foreground hover:bg-nav-hover'

// The current page: primary accent, like the chosen option in AppSelect
const CURRENT_PAGE_CLASS =
  'border-primary bg-primary/10 font-semibold text-primary'
</script>

<template>
  <nav
    :data-component-name="COMPONENT_NAME"
    :aria-label="t('table.pagination')"
  >
    <ul class="flex items-center gap-1">
      <li>
        <button
          type="button"
          :class="[BUTTON_CLASS, ARROW_CLASS]"
          :disabled="page <= FIRST_PAGE"
          :aria-label="t('table.firstPage')"
          @click="goTo(FIRST_PAGE)"
        >
          <IconChevronsLeft class="size-4" />
        </button>
      </li>
      <li>
        <button
          type="button"
          :class="[BUTTON_CLASS, ARROW_CLASS]"
          :disabled="page <= FIRST_PAGE"
          :aria-label="t('table.prevPage')"
          @click="goTo(page - 1)"
        >
          <IconChevronDown class="size-4 rotate-90" />
        </button>
      </li>

      <li v-for="item in items" :key="item">
        <span
          v-if="typeof item !== 'number'"
          class="flex h-10 min-w-6 items-center justify-center text-sm text-muted"
          aria-hidden="true"
        >
          …
        </span>
        <button
          v-else
          type="button"
          :class="[
            BUTTON_CLASS,
            item === page ? CURRENT_PAGE_CLASS : PAGE_CLASS,
          ]"
          :aria-label="t('table.page', { page: item })"
          :aria-current="item === page ? 'page' : undefined"
          @click="goTo(item)"
        >
          {{ item }}
        </button>
      </li>

      <li>
        <button
          type="button"
          :class="[BUTTON_CLASS, ARROW_CLASS]"
          :disabled="page >= pageCount"
          :aria-label="t('table.nextPage')"
          @click="goTo(page + 1)"
        >
          <IconChevronDown class="size-4 -rotate-90" />
        </button>
      </li>
      <li>
        <button
          type="button"
          :class="[BUTTON_CLASS, ARROW_CLASS]"
          :disabled="page >= pageCount"
          :aria-label="t('table.lastPage')"
          @click="goTo(pageCount)"
        >
          <IconChevronsLeft class="size-4 rotate-180" />
        </button>
      </li>
    </ul>
  </nav>
</template>
