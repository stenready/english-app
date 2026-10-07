import { HTTP_STATUS } from '#constants/httpStatus'
import { AppError } from '#errors/AppError'
import userRepository from '#repositories/user'
import type { User, UserInput } from '#types/user'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_MIN_LENGTH = 2
// ids are Postgres uuid: a malformed id can't exist, and would make the query itself fail
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

const assertEmailIsFree = async (email: string, currentUserId?: string): Promise<void> => {
  const owner = await userRepository.findByEmail(email)

  if (owner && owner.id !== currentUserId) {
    throw new AppError(HTTP_STATUS.CONFLICT, 'Email is already taken.')
  }
}

const getUsers = (): Promise<User[]> => userRepository.findAll()

const getUser = async (id: string): Promise<User> => {
  const user = UUID_PATTERN.test(id) ? await userRepository.findById(id) : null

  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, `User ${id} was not found.`)
  }

  return user
}

const createUser = async (payload: unknown): Promise<User> => {
  const data = assertValid(payload)

  await assertEmailIsFree(data.email)

  return userRepository.create(data)
}

const updateUser = async (id: string, payload: unknown): Promise<User> => {
  const user = await getUser(id)
  const changes = isRecord(payload) ? payload : {}
  const data = assertValid({
    email: changes.email ?? user.email,
    name: changes.name ?? user.name,
  })

  await assertEmailIsFree(data.email, id)

  return userRepository.update(id, data)
}

const deleteUser = async (id: string): Promise<void> => {
  await getUser(id)

  await userRepository.remove(id)
}

export default { createUser, deleteUser, getUser, getUsers, updateUser }
