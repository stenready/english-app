import { z } from 'zod'
import { UPLOAD_FOLDERS } from '#constants/uploads'
import { UserStatus } from '#generated/prisma/enums'
import { pageParamsSchema } from '#validation/pagination'

const NAME_MIN_LENGTH = 2
const PASSWORD_MIN_LENGTH = 8
// argon2 takes any length; the cap only limits the hashing cost of a huge body
const PASSWORD_MAX_LENGTH = 128
// Same limit as the admin block form
const BLOCK_REASON_MAX_LENGTH = 500
// Same limit as the admin search input
const SEARCH_MAX_LENGTH = 50
// Only keys that POST /uploads/images creates for avatars: user/avatars/<uuid>.webp
const AVATAR_KEY_PATTERN = new RegExp(
  `^${UPLOAD_FOLDERS.USER_AVATARS}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.webp$`,
)

// Body of POST /users. Emails are case-insensitive: normalized before the check
const userFieldsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  name: z.string().trim().min(NAME_MIN_LENGTH),
  // Not trimmed: spaces are valid password characters
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
  // From POST /uploads/images; null removes the avatar
  avatarKey: z.string().regex(AVATAR_KEY_PATTERN).nullable().optional(),
  // No status: the database default (ACTIVE)
  status: z.enum(UserStatus).optional(),
  // Only with status BLOCKED; any other status clears it
  blockReason: z.string().trim().min(1).max(BLOCK_REASON_MAX_LENGTH).optional(),
})

const isBlockReasonGiven = (data: { status?: UserStatus; blockReason?: string }): boolean => {
  return data.status !== UserStatus.BLOCKED || Boolean(data.blockReason)
}

const BLOCK_REASON_REQUIRED = {
  path: ['blockReason'],
  message: 'Required when the status is BLOCKED.',
}

// Refined separately: Zod can't .partial() a schema that already has a refinement
export const userInputSchema = userFieldsSchema.refine(isBlockReasonGiven, BLOCK_REASON_REQUIRED)

// Body of PATCH /users/:id: only the fields that change; no password keeps the old one
export const userUpdateSchema = userFieldsSchema
  .partial()
  .refine(isBlockReasonGiven, BLOCK_REASON_REQUIRED)

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
