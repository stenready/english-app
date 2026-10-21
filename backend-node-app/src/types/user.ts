import type { User as UserRecord } from '#generated/prisma/client'
import type { UserInput, UserListQuery } from '#validation/user'

export type { UserInput } from '#validation/user'

// What the API works with: the password hash never leaves the database layer
// (omitted for every query in #db/client)
export type User = Omit<UserRecord, 'passwordHash'>

// What the API returns: avatarKey plus ready links: the thumbnail and the full-size copy
export type UserResponse = User & {
  avatarUrl: string | null
  avatarOriginalUrl: string | null
}

// What the repository writes: the service has already hashed the password
export type UserCreateData = Omit<UserInput, 'password' | 'blockReason'> & {
  passwordHash: string
  // null clears it
  blockReason?: string | null
}

export type UserUpdateData = Partial<UserCreateData>

// List filters from the query: ?search=stas
export type UserFilters = Pick<UserListQuery, 'search'>
