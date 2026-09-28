import { HTTP_STATUS } from '#constants/httpStatus'
import { AppError } from '#errors/AppError'
import userRepository from '#repositories/user'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_MIN_LENGTH = 2

const assertValid = (payload) => {
  const { email, name } = payload ?? {}
  const issues = []

  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
    issues.push({ field: 'email', message: 'Must be a valid email address.' })
  }

  if (typeof name !== 'string' || name.trim().length < NAME_MIN_LENGTH) {
    issues.push({ field: 'name', message: `Must be at least ${NAME_MIN_LENGTH} characters.` })
  }

  if (issues.length > 0) {
    throw new AppError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'Validation failed.', issues)
  }

  return { email, name: name.trim() }
}

const assertEmailIsFree = (email, currentUserId) => {
  const owner = userRepository.findByEmail(email)

  if (owner && owner.id !== currentUserId) {
    throw new AppError(HTTP_STATUS.CONFLICT, 'Email is already taken.')
  }
}

const getUsers = () => userRepository.findAll()

const getUser = (id) => {
  const user = userRepository.findById(id)

  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, `User ${id} was not found.`)
  }

  return user
}

const createUser = (payload) => {
  const data = assertValid(payload)

  assertEmailIsFree(data.email)

  return userRepository.create(data)
}

const updateUser = (id, payload) => {
  const user = getUser(id)
  const data = assertValid({
    email: payload?.email ?? user.email,
    name: payload?.name ?? user.name,
  })

  assertEmailIsFree(data.email, id)

  return userRepository.update(id, data)
}

const deleteUser = (id) => {
  getUser(id)

  userRepository.remove(id)
}

export default { createUser, deleteUser, getUser, getUsers, updateUser }
