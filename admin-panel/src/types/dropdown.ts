import type { Component } from 'vue'

export interface AppDropdownItem<TKey extends string = string> {
  // Emitted on select: @select="(key) => …"
  key: TKey
  label: string
  // An icon component from @/components/svg, shown before the label
  icon?: Component
  // Destructive action (delete…): danger color, separated from the others by a line
  danger?: boolean
  // false hides the item (e.g. no permission); undefined counts as shown
  isShow?: boolean
}
