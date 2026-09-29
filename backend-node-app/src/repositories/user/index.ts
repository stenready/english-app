import { randomUUID } from 'node:crypto'
import type { User, UserInput } from '#types/user'

const users = new Map<string, User>()

const findAll = (): User[] => [...users.values()]

const findById = (id: string): User | null => users.get(id) ?? null

const findByEmail = (email: string): User | null =>
  [...users.values()].find((user) => user.email === email) ?? null

const create = ({ email, name }: UserInput): User => {
  const user: User = {
    createdAt: new Date().toISOString(),
    email,
    id: randomUUID(),
    name,
  }

  users.set(user.id, user)

  return user
}

const update = (id: string, changes: Partial<UserInput>): User | null => {
  const user = users.get(id)

  if (!user) {
    return null
  }

  const updated = { ...user, ...changes }

  users.set(id, updated)

  return updated
}

const remove = (id: string): boolean => users.delete(id)

export default { create, findAll, findByEmail, findById, remove, update }
