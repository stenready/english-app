<script setup lang="ts" generic="TRow extends object">
import { computed, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppPagination from '@/components/app/AppPagination.vue'
import AppButton from '@/components/app/AppButton.vue'
import AppSelect from '@/components/app/forms/AppSelect.vue'
import IconChevronDown from '@/components/svg/IconChevronDown.vue'
import IconClose from '@/components/svg/IconClose.vue'
import IconSort from '@/components/svg/IconSort.vue'
import {
  DEFAULT_TABLE_FIRST,
  TABLE_FIRST_OPTIONS,
} from '@/constants/tablePagination'
import type { AppSelectOption } from '@/types/select'
import type { AppTableColumn, AppTablePagination } from '@/types/table'

const COMPONENT_NAME = 'AppTable'

defineOptions({ name: COMPONENT_NAME })

const props = defineProps<{
  columns: AppTableColumn[]
  rows: TRow[]
  rowKey: keyof TRow
  // Extra classes for a row, e.g. (row) => (row.isBlocked ? 'bg-danger/5' : undefined).
  // Use colors, not opacity: a faded sticky cell would show the columns under it
  tbodyTrClass?: (row: TRow, index: number) => string | undefined
  // @row-click. A prop, not an emit: the table must know if anyone listens,
  // only then rows get the pointer cursor and keyboard focus
  onRowClick?: (row: TRow) => void
  // Rows scroll inside the table (up to the screen height) and the header stays.
  // CSS can't stick it to the page scroll: the horizontal scroll container catches it
  stickyHeader?: boolean
  // "First 10/20/…" selector in the header; the choice comes in v-model:pagination
  isShowFirstSelector?: boolean
  // Page buttons in the header; the choice comes in v-model:pagination
  isShowPagination?: boolean
  // All rows across pages (the table itself only gets the current page)
  totalRows?: number
  // Applied filters: a badge with the number on the "Filter" button (hidden at 0)
  filtersCount?: number
}>()

const emit = defineEmits<{
  // ✕ on the Filter button: the page clears its filters
  resetFilters: []
}>()

// v-model:pagination (or :pagination + @update:pagination to send a request):
// the page sets first/skip from above (e.g. skip: 0 on a new search) and the table
// shows them; without it the table keeps its own state from the default
const pagination = defineModel<AppTablePagination>('pagination', {
  default: () => ({ first: DEFAULT_TABLE_FIRST, skip: 0 }),
})

// Optional v-model:filters-open, e.g. to keep the panel open while filters are applied
const isFiltersOpen = defineModel<boolean>('filtersOpen', { default: false })

defineSlots<{
  header?: () => unknown
  // Controls on the right of the header row (page size, filters…)
  headerActions?: () => unknown
  // Filter controls: a "Filter" toggle appears in the header, the slot opens under it
  filters?: () => unknown
  empty?: () => unknown
  [cell: `cell-${string}`]: (props: { row: TRow; index: number }) => unknown
  [head: `head-${string}`]: (props: { column: AppTableColumn }) => unknown
}>()

const { t } = useI18n()
const filtersId = useId()

const firstOptions = computed<AppSelectOption<number>[]>(() =>
  TABLE_FIRST_OPTIONS.map((count) => ({
    value: count,
    label: t('table.firstRows', { count }),
  })),
)

const FIRST_PAGE = 1

// Derived from skip: the page number lives only in pagination
const page = computed<number>(() => {
  return Math.floor(pagination.value.skip / pagination.value.first) + FIRST_PAGE
})

const totalRowsCount = computed<number>(
  () => props.totalRows ?? props.rows.length,
)

const pageCount = computed<number>(() =>
  Math.max(
    FIRST_PAGE,
    Math.ceil(totalRowsCount.value / pagination.value.first),
  ),
)

// One assignment = one update:pagination event = one request
const updatePagination = (changes: Partial<AppTablePagination>): void => {
  pagination.value = { ...pagination.value, ...changes }
}

const getSkip = (pageNumber: number): number => {
  return (pageNumber - FIRST_PAGE) * pagination.value.first
}

// A new page size starts from the first page
const onFirstChange = (first: number): void => {
  updatePagination({ first, skip: 0 })
}

// A new column starts ascending, the same one flips; the order changes, so back to page 1
const sortBy = (key: string): void => {
  const { sortKey, reverse } = pagination.value

  updatePagination({
    sortKey: key,
    reverse: sortKey === key ? !reverse : false,
    skip: 0,
  })
}

const getSortDirection = (key: string): 'asc' | 'desc' | undefined => {
  if (pagination.value.sortKey !== key) return undefined

  return pagination.value.reverse ? 'desc' : 'asc'
}

const getAriaSort = (
  column: AppTableColumn,
): 'ascending' | 'descending' | 'none' | undefined => {
  if (!column.isSortable) return undefined
  if (pagination.value.sortKey !== column.key) return 'none'

  return pagination.value.reverse ? 'descending' : 'ascending'
}

// Hidden when everything fits on one page
const isPaginationVisible = computed<boolean>(
  () => Boolean(props.isShowPagination) && pageCount.value > FIRST_PAGE,
)

const onPageChange = (value: number): void => {
  updatePagination({ skip: getSkip(value) })
}

// Fewer rows (e.g. rows deleted) may leave the current page out of range
watch(pageCount, (count) => {
  if (page.value > count) updatePagination({ skip: getSkip(count) })
})

// A column key may be virtual (e.g. "actions"), so it is not tied to keyof TRow
const getCellValue = (row: TRow, key: string): unknown => {
  return (row as Record<string, unknown>)[key]
}

const getRowKey = (row: TRow): string => {
  return String(row[props.rowKey])
}

const getRowClass = (row: TRow, index: number): string | undefined => {
  return props.tbodyTrClass?.(row, index)
}

// Controls inside the row (actions menu, links…) handle their own clicks
const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, label, [role="button"]'

const onRowClick = (event: MouseEvent, row: TRow): void => {
  if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return

  props.onRowClick?.(row)
}

// Opaque background so scrolled columns don't show through; the inset shadow
// is the divider (a border would vanish with collapsed table borders)
const STICKY_CLASS = 'sticky right-0 z-10 shadow-[inset_1px_0_0_var(--border)]'

// Screen height minus the app top bar, page paddings and the table title:
// once the page is scrolled to the table, the table fills the screen
const STICKY_HEADER_MAX_HEIGHT = 'max-h-[calc(100dvh-12rem)]'
</script>

<template>
  <div
    :data-component-name="COMPONENT_NAME"
    class="overflow-hidden rounded-xl border border-border bg-background shadow-xs"
  >
    <div
      v-if="
        $slots.header ||
        $slots.headerActions ||
        $slots.filters ||
        props.isShowFirstSelector ||
        isPaginationVisible
      "
      class="preview-table flex items-center justify-between gap-4 border-b border-border px-5 py-3"
    >
      <div class="text-[15px] font-semibold">
        <slot name="header" />
      </div>
      <div
        v-if="
          $slots.headerActions ||
          $slots.filters ||
          props.isShowFirstSelector ||
          isPaginationVisible
        "
        class="flex flex-wrap items-center justify-end gap-2"
      >
        <slot name="headerActions" />
        <AppPagination
          v-if="isPaginationVisible"
          :page="page"
          :total-rows="totalRowsCount"
          :per-page="pagination.first"
          @update:page="onPageChange"
        />
        <AppSelect
          v-if="props.isShowFirstSelector"
          data-name="table-first"
          :model-value="pagination.first"
          :options="firstOptions"
          :aria-label="t('table.pageSize')"
          @update:model-value="onFirstChange"
        />
        <!-- Filter toggle + ✕ reset as one group: a button can't contain a button -->
        <div v-if="$slots.filters" class="relative inline-flex">
          <AppButton
            data-name="table-filters-toggle"
            variant="outline"
            :class="{ 'rounded-r-none': props.filtersCount }"
            :aria-expanded="isFiltersOpen"
            :aria-controls="filtersId"
            @click="isFiltersOpen = !isFiltersOpen"
          >
            {{ t('table.filter') }}
            <IconChevronDown
              class="transition-transform duration-200"
              :class="{ 'rotate-180': isFiltersOpen }"
            />
            <span v-if="props.filtersCount" class="sr-only">
              {{ t('table.activeFilters', { count: props.filtersCount }) }}
            </span>
          </AppButton>
          <AppButton
            v-if="props.filtersCount"
            data-name="table-filters-reset"
            variant="outline"
            class="-ml-px rounded-l-none px-3"
            :aria-label="t('table.resetFilters')"
            @click="emit('resetFilters')"
          >
            <IconClose />
          </AppButton>
          <span
            v-if="props.filtersCount"
            class="pointer-events-none absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs leading-none font-semibold text-primary-foreground ring-2 ring-background"
            aria-hidden="true"
          >
            {{ props.filtersCount }}
          </span>
        </div>
      </div>
    </div>

    <!-- Height animates via grid rows 0fr → 1fr (as the field error does).
         1fr only in enter-to / leave-from: a static class would override 0fr -->
    <Transition
      enter-active-class="transition-all duration-250 ease-out motion-reduce:transition-none"
      enter-from-class="grid-rows-[0fr] opacity-0"
      enter-to-class="grid-rows-[1fr]"
      leave-from-class="grid-rows-[1fr]"
      leave-active-class="transition-all duration-200 ease-in motion-reduce:transition-none"
      leave-to-class="grid-rows-[0fr] opacity-0"
    >
      <div
        v-if="$slots.filters && isFiltersOpen"
        :id="filtersId"
        class="grid border-b border-border bg-surface"
      >
        <div class="min-h-0 overflow-hidden">
          <div class="px-5 py-4">
            <slot name="filters" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Wide tables scroll horizontally instead of stretching the page -->
    <div
      :class="
        props.stickyHeader
          ? ['overflow-auto', STICKY_HEADER_MAX_HEIGHT]
          : 'overflow-x-auto'
      "
    >
      <table class="w-full text-left text-sm">
        <!-- Inset shadow instead of border-b: a border would scroll away when sticky -->
        <thead
          class="bg-surface shadow-[inset_0_-1px_0_var(--border)]"
          :class="{ 'sticky top-0 z-20': props.stickyHeader }"
        >
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="px-5 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap text-muted uppercase"
              :class="[
                column.thClassName,
                column.isSticky && [STICKY_CLASS, 'bg-surface'],
              ]"
              :aria-sort="getAriaSort(column)"
            >
              <button
                v-if="column.isSortable"
                type="button"
                class="group/sort inline-flex cursor-pointer items-center gap-1 rounded uppercase outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/30"
                :class="{
                  'text-foreground': pagination.sortKey === column.key,
                }"
                @click="sortBy(column.key)"
              >
                <slot :name="`head-${column.key}`" :column="column">
                  {{ column.label }}
                </slot>
                <IconSort
                  class="size-3.5 shrink-0 transition-opacity"
                  :class="{
                    'opacity-50 group-hover/sort:opacity-100':
                      pagination.sortKey !== column.key,
                  }"
                  :direction="getSortDirection(column.key)"
                />
              </button>
              <slot v-else :name="`head-${column.key}`" :column="column">
                {{ column.label }}
              </slot>
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-border">
          <tr
            v-for="(row, index) in rows"
            :key="getRowKey(row)"
            class="group transition-colors outline-none hover:bg-surface focus-visible:bg-surface"
            :class="[
              getRowClass(row, index),
              { 'cursor-pointer': props.onRowClick },
            ]"
            :tabindex="props.onRowClick ? 0 : undefined"
            @click="onRowClick($event, row)"
            @keydown.enter.self="props.onRowClick?.(row)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-5 py-3 align-middle"
              :class="
                column.isSticky && [
                  STICKY_CLASS,
                  'bg-background transition-colors group-hover:bg-surface',
                ]
              "
            >
              <!-- The row's own classes (tint) over the opaque sticky background:
                   -z-10 paints it above the cell background but under its content.
                   Hidden on hover, like the row's tint under hover:bg-surface -->
              <span
                v-if="column.isSticky && getRowClass(row, index)"
                class="pointer-events-none absolute inset-0 -z-10 group-hover:hidden"
                :class="getRowClass(row, index)"
                aria-hidden="true"
              />
              <slot :name="`cell-${column.key}`" :row="row" :index="index">
                {{ getCellValue(row, column.key) }}
              </slot>
            </td>
          </tr>

          <tr v-if="!rows.length && $slots.empty">
            <td
              :colspan="columns.length"
              class="px-6 py-12 text-center text-muted"
            >
              <slot name="empty" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
