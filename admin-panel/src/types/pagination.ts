// List responses of the API: GET /users?first=10&skip=0
export interface PageMeta {
  // Found items in total, not only on this page
  totalCount: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PageResponse<TItem> {
  data: TItem[]
  meta: PageMeta
}
