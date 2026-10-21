import { hash } from 'argon2'
import { ERROR_CODES } from '#constants/errorCodes'
import { HTTP_STATUS } from '#constants/httpStatus'
import { AppError } from '#errors/AppError'
import { UserStatus } from '#generated/prisma/enums'
import { getOriginalKey } from '#helpers/imageKeys'
import { createPage } from '#helpers/pagination'
import userRepository from '#repositories/user'
import storage from '#storage/s3'
import { parseOrThrow } from '#validation/parseOrThrow'
import {
  userInputSchema,
  userListQuerySchema,
  userParamsSchema,
  userUpdateSchema,
} from '#validation/user'
import type { Page } from '#types/pagination'
import type { User, UserResponse } from '#types/user'

const assertEmailIsFree = async (email: string, currentUserId?: string): Promise<void> => {
  const owner = await userRepository.findByEmail(email)

  if (owner && owner.id !== currentUserId) {
    throw new AppError(HTTP_STATUS.CONFLICT, ERROR_CODES.EMAIL_TAKEN, 'Email is already taken.')
  }
}

const toUserResponse = (user: User): UserResponse => {
  return {
    ...user,
    avatarUrl: user.avatarKey ? storage.getPublicUrl(user.avatarKey) : null,
    avatarOriginalUrl: user.avatarKey ? storage.getPublicUrl(getOriginalKey(user.avatarKey)) : null,
  }
}

// The files are no longer referenced: a failed delete only leaves an orphan, the save stands
const deleteImageQuietly = async (key: string): Promise<void> => {
  await Promise.all(
    [key, getOriginalKey(key)].map(async (fileKey) => {
      try {
        await storage.deleteObject(fileKey)
      } catch (error) {
        console.error(`Failed to delete ${fileKey} from storage:`, error)
      }
    }),
  )
}

const getUsers = async (query: unknown): Promise<Page<UserResponse>> => {
  const { first, skip, search } = parseOrThrow(userListQuerySchema, query)
  const { users, totalCount } = await userRepository.findPage({ first, skip }, { search })

  return createPage({ items: users.map(toUserResponse), totalCount, skip })
}

// Malformed id: 422 (client error, no query); well-formed but absent: 404
const findUserOrThrow = async (id: string): Promise<User> => {
  parseOrThrow(userParamsSchema, { id })

  const user = await userRepository.findById(id)

  if (!user) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.USER_NOT_FOUND,
      `User ${id} was not found.`,
    )
  }

  return user
}

const getUser = async (id: string): Promise<UserResponse> => {
  return toUserResponse(await findUserOrThrow(id))
}

const createUser = async (payload: unknown): Promise<UserResponse> => {
  const { password, ...data } = parseOrThrow(userInputSchema, payload)

  await assertEmailIsFree(data.email)

  const user = await userRepository.create({
    ...data,
    // A reason without the BLOCKED status means nothing
    blockReason: data.status === UserStatus.BLOCKED ? data.blockReason : null,
    passwordHash: await hash(password),
  })

  return toUserResponse(user)
}

const updateUser = async (id: string, payload: unknown): Promise<UserResponse> => {
  const user = await findUserOrThrow(id)
  const { password, avatarKey, ...changes } = parseOrThrow(userUpdateSchema, payload)
  const email = changes.email ?? user.email
  // undefined: not sent, keep; null: remove; a key: replace
  const isAvatarChanged = avatarKey !== undefined && avatarKey !== user.avatarKey

  await assertEmailIsFree(email, id)

  const updatedUser = await userRepository.update(id, {
    email,
    name: changes.name ?? user.name,
    // undefined: Prisma keeps the current one
    status: changes.status,
    // Status sent: BLOCKED takes the reason, any other clears it. Not sent: kept
    ...(changes.status && {
      blockReason: changes.status === UserStatus.BLOCKED ? changes.blockReason : null,
    }),
    ...(isAvatarChanged && { avatarKey }),
    // Hashed only when a new one is sent
    ...(password && { passwordHash: await hash(password) }),
  })

  // After the save: if it failed, the old avatar is still in use
  if (isAvatarChanged && user.avatarKey) {
    await deleteImageQuietly(user.avatarKey)
  }

  return toUserResponse(updatedUser)
}

const deleteUser = async (id: string): Promise<void> => {
  const user = await findUserOrThrow(id)

  await userRepository.remove(id)

  if (user.avatarKey) {
    await deleteImageQuietly(user.avatarKey)
  }
}

export default { createUser, deleteUser, getUser, getUsers, updateUser }
