import type { Page } from '#types/pagination'

interface CreatePageOptions<TItem> {
  items: TItem[]
  // All rows matching the request, across all pages
  totalCount: number
  // The skip of this request
  skip: number
}

// Same { items, meta } shape for every list endpoint
export const createPage = <TItem>({
  items,
  totalCount,
  skip,
}: CreatePageOptions<TItem>): Page<TItem> => {
  return {
    items,
    meta: {
      totalCount,
      hasNext: skip + items.length < totalCount,
      hasPrev: skip > 0,
    },
  }
}
