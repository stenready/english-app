export type { PageParams } from '#validation/pagination'

// Service object sent next to the list: { data: [...], meta: { ... } }
export interface PageMeta {
  // All rows matching the request, across all pages
  totalCount: number
  hasNext: boolean
  hasPrev: boolean
}

export interface Page<TItem> {
  items: TItem[]
  meta: PageMeta
}
