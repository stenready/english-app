<script setup lang="ts" generic="TRow extends object">
import type { AppTableColumn } from '@/types/table'

const COMPONENT_NAME = 'AppTable'

defineOptions({ name: COMPONENT_NAME })

const props = defineProps<{
  columns: AppTableColumn[]
  rows: TRow[]
  rowKey: keyof TRow
  // Extra classes for a row, e.g. (row) => (row.isBlocked ? 'bg-danger/5' : undefined).
  // Use colors, not opacity: a faded sticky cell would show the columns under it
  tbodyTrClass?: (row: TRow, index: number) => string | undefined
}>()

defineSlots<{
  header?: () => unknown
  empty?: () => unknown
  [cell: `cell-${string}`]: (props: { row: TRow; index: number }) => unknown
  [head: `head-${string}`]: (props: { column: AppTableColumn }) => unknown
}>()

// A column key may be virtual (e.g. "actions"), so it is not tied to keyof TRow
const getCellValue = (row: TRow, key: string): unknown =>
  (row as Record<string, unknown>)[key]

const getRowKey = (row: TRow): string => String(row[props.rowKey])

const getRowClass = (row: TRow, index: number): string | undefined =>
  props.tbodyTrClass?.(row, index)

// Opaque background so scrolled columns don't show through; the inset shadow
// is the divider (a border would vanish with collapsed table borders)
const STICKY_CLASS = 'sticky right-0 z-10 shadow-[inset_1px_0_0_var(--border)]'
</script>

<template>
  <div
    :data-component-name="COMPONENT_NAME"
    class="overflow-hidden rounded-xl border border-border bg-background shadow-xs"
  >
    <div
      v-if="$slots.header"
      class="border-b border-border px-5 py-4 text-[15px] font-semibold"
    >
      <slot name="header" />
    </div>

    <!-- Wide tables scroll horizontally instead of stretching the page -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-border bg-surface">
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
            >
              <slot :name="`head-${column.key}`" :column="column">
                {{ column.label }}
              </slot>
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-border">
          <tr
            v-for="(row, index) in rows"
            :key="getRowKey(row)"
            class="group transition-colors hover:bg-surface"
            :class="getRowClass(row, index)"
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
