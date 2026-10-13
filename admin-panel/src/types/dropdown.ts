export interface AppDropdownItem<TKey extends string = string> {
  // Emitted on select: @select="(key) => …"
  key: TKey
  label: string
  // Destructive action (delete…): shown in the danger color
  danger?: boolean
}
