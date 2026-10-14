// Emitted by AppTable's @pagination: ready for a first/skip API
export interface AppTablePagination {
  // How many rows to take
  first: number
  // How many rows to skip: (page - 1) * first
  skip: number
  // Column key to sort by; undefined until a sortable header is clicked
  sortKey?: string
  // false: ascending, true: descending; comes together with sortKey
  reverse?: boolean
}

export interface AppTableColumn {
  // Row field shown by default; also names the slots: #cell-<key>, #head-<key>
  key: string
  label: string
  // Sticks to the right edge while the table scrolls horizontally (e.g. actions).
  // Meant for the last column: several sticky columns would overlap
  isSticky?: boolean
  thClassName?: string
  // Header becomes a button: asc → desc → asc…; the choice comes in @pagination
  isSortable?: boolean
}
