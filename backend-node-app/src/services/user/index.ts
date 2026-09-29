import { HTTP_STATUS } from '#constants/httpStatus'
import { AppError } from '#errors/AppError'
import userRepository from '#repositories/user'
import type { User, UserInput } from '#types/user'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_MIN_LENGTH = 2

interface ValidationIssue {
  field: keyof UserInput
  message: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const assertValid = (payload: unknown): UserInput => {
  const { email, name } = isRecord(payload) ? payload : {}
  const issues: ValidationIssue[] = []

  // Emails are case-insensitive: normalize before validating and comparing
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    issues.push({ field: 'email', message: 'Must be a valid email address.' })
  }

  const normalizedName = typeof name === 'string' ? name.trim() : ''

  if (normalizedName.length < NAME_MIN_LENGTH) {
    issues.push({ field: 'name', message: `Must be at least ${NAME_MIN_LENGTH} characters.` })
  }

  if (issues.length > 0) {
    throw new AppError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'Validation failed.', issues)
  }

  return { email: normalizedEmail, name: normalizedName }
}

const assertEmailIsFree = (email: string, currentUserId?: string): void => {
  const owner = userRepository.findByEmail(email)

  if (owner && owner.id !== currentUserId) {
    throw new AppError(HTTP_STATUS.CONFLICT, 'Email is already taken.')
  }
}

const getUsers = (): User[] => userRepository.findAll()

const getUser = (id: string): User => {
  const user = userRepository.findById(id)

  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, `User ${id} was not found.`)
  }

  return user
}

const createUser = (payload: unknown): User => {
  const data = assertValid(payload)

  assertEmailIsFree(data.email)

  return userRepository.create(data)
}

const updateUser = (id: string, payload: unknown): User => {
  const user = getUser(id)
  const changes = isRecord(payload) ? payload : {}
  const data = assertValid({
    email: changes.email ?? user.email,
    name: changes.name ?? user.name,
  })

  assertEmailIsFree(data.email, id)

  // getUser above guarantees the user exists
  return userRepository.update(id, data) as User
}

const deleteUser = (id: string): void => {
  getUser(id)

  userRepository.remove(id)
}

export default { createUser, deleteUser, getUser, getUsers, updateUser }
