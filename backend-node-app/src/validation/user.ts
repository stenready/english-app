import { z } from 'zod'
import { pageParamsSchema } from '#validation/pagination'

const NAME_MIN_LENGTH = 2
// Same limit as the admin search input
const SEARCH_MAX_LENGTH = 50

// Body of POST /users. Emails are case-insensitive: normalized before the check
export const userInputSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  name: z.string().trim().min(NAME_MIN_LENGTH),
})

// Body of PATCH /users/:id: only the fields that change
export const userUpdateSchema = userInputSchema.partial()

// GET /users?first=10&skip=0&search=stas
export const userListQuerySchema = pageParamsSchema.extend({
  // Part of the name or email; empty: no search
  search: z.string().trim().max(SEARCH_MAX_LENGTH).optional(),
})

// /users/:id. ids are Postgres uuid: a malformed one would make the query itself fail
export const userParamsSchema = z.object({
  id: z.uuid(),
})

export type UserInput = z.infer<typeof userInputSchema>
export type UserListQuery = z.infer<typeof userListQuerySchema>
