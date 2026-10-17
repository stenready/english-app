import type { User as UserRecord } from '#generated/prisma/client'
import type { UserListQuery } from '#validation/user'

export type { UserInput } from '#validation/user'

// What the API works with: the password hash never leaves the database layer
// (omitted for every query in #db/client)
export type User = Omit<UserRecord, 'passwordHash'>

// List filters from the query: ?search=stas
export type UserFilters = Pick<UserListQuery, 'search'>
