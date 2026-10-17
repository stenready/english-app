import { ERROR_CODES } from '#constants/errorCodes'
import { HTTP_STATUS } from '#constants/httpStatus'
import { AppError } from '#errors/AppError'
import { createPage } from '#helpers/pagination'
import userRepository from '#repositories/user'
import { parseOrThrow } from '#validation/parseOrThrow'
import {
  userInputSchema,
  userListQuerySchema,
  userParamsSchema,
  userUpdateSchema,
} from '#validation/user'
import type { Page } from '#types/pagination'
import type { User } from '#types/user'

const assertEmailIsFree = async (email: string, currentUserId?: string): Promise<void> => {
  const owner = await userRepository.findByEmail(email)

  if (owner && owner.id !== currentUserId) {
    throw new AppError(HTTP_STATUS.CONFLICT, ERROR_CODES.EMAIL_TAKEN, 'Email is already taken.')
  }
}

const getUsers = async (query: unknown): Promise<Page<User>> => {
  const { first, skip, search } = parseOrThrow(userListQuerySchema, query)
  const { users, totalCount } = await userRepository.findPage({ first, skip }, { search })

  return createPage({ items: users, totalCount, skip })
}

// Malformed id: 422 (client error, no query); well-formed but absent: 404
const getUser = async (id: string): Promise<User> => {
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

const createUser = async (payload: unknown): Promise<User> => {
  const data = parseOrThrow(userInputSchema, payload)

  await assertEmailIsFree(data.email)

  return userRepository.create(data)
}

const updateUser = async (id: string, payload: unknown): Promise<User> => {
  const user = await getUser(id)
  const changes = parseOrThrow(userUpdateSchema, payload)
  const data = {
    email: changes.email ?? user.email,
    name: changes.name ?? user.name,
  }

  await assertEmailIsFree(data.email, id)

  return userRepository.update(id, data)
}

const deleteUser = async (id: string): Promise<void> => {
  await getUser(id)

  await userRepository.remove(id)
}

export default { createUser, deleteUser, getUser, getUsers, updateUser }
