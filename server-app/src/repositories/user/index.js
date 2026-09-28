import { randomUUID } from 'node:crypto'

const users = new Map()

const findAll = () => [...users.values()]

const findById = (id) => users.get(id) ?? null

const findByEmail = (email) => [...users.values()].find((user) => user.email === email) ?? null

const create = ({ email, name }) => {
  const user = {
    createdAt: new Date().toISOString(),
    email,
    id: randomUUID(),
    name,
  }

  users.set(user.id, user)

  return user
}

const update = (id, changes) => {
  const user = users.get(id)

  if (!user) {
    return null
  }

  const updated = { ...user, ...changes }

  users.set(id, updated)

  return updated
}

const remove = (id) => users.delete(id)

export default { create, findAll, findByEmail, findById, remove, update }
