import { z } from 'zod'

const DEFAULT_FIRST = 10
// Caps one request: ?first=1000000 must not load the whole table
const MAX_FIRST = 100
const DEFAULT_SKIP = 0

// ?first=10&skip=20 (same names as the admin table). Query values are strings:
// coerce turns "10" into 10; a missing value takes the default
export const pageParamsSchema = z.object({
  first: z.coerce.number().int().min(1).max(MAX_FIRST).default(DEFAULT_FIRST),
  skip: z.coerce.number().int().min(0).default(DEFAULT_SKIP),
})

export type PageParams = z.infer<typeof pageParamsSchema>
