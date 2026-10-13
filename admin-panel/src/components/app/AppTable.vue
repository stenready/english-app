<script setup lang="ts" generic="TRow extends object">
import type { AppTableColumn } from '@/types/table'

const COMPONENT_NAME = 'AppTable'

defineOptions({ name: COMPONENT_NAME })

const props = defineProps<{
  columns: AppTableColumn[]
  rows: TRow[]
  rowKey: keyof TRow
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
</script>

<template>
  <div
    :data-component-name="COMPONENT_NAME"
    class="overflow-hidden rounded-xl border border-border bg-background"
  >
    <div
      v-if="$slots.header"
      class="border-b border-border px-6 py-4 font-semibold"
    >
      <slot name="header" />
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-border bg-surface">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="px-6 py-3 font-medium whitespace-nowrap text-muted"
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
            class="transition-colors hover:bg-surface"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 align-middle"
            >
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
