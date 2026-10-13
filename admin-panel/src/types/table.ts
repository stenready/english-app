export interface AppTableColumn {
  // Row field shown by default; also names the slots: #cell-<key>, #head-<key>
  key: string
  label: string
  // Sticks to the right edge while the table scrolls horizontally (e.g. actions).
  // Meant for the last column: several sticky columns would overlap
  isSticky?: boolean
  thClassName?: string
}
