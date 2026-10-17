import { prisma } from '#db/client'
import type { Prisma } from '#generated/prisma/client'
import { escapeLike } from '#helpers/escapeLike'
import type { PageParams } from '#types/pagination'
import type { User, UserFilters, UserInput } from '#types/user'

interface UsersPage {
  users: User[]
  totalCount: number
}

// ILIKE '%search%' on name or email; no search: every user
const getWhere = ({ search }: UserFilters): Prisma.UserWhereInput => {
  if (!search) return {}

  const escapedSearch = escapeLike(search)

  return {
    OR: [
      { name: { contains: escapedSearch, mode: 'insensitive' } },
      { email: { contains: escapedSearch, mode: 'insensitive' } },
    ],
  }
}

// One transaction: the page and the count see the same data.
// count() takes the same where: totalCount is the number of found users, not of all
const findPage = async ({ first, skip }: PageParams, filters: UserFilters): Promise<UsersPage> => {
  const where = getWhere(filters)
  const [users, totalCount] = await prisma.$transaction([
    prisma.user.findMany({ where, orderBy: { createdAt: 'asc' }, skip, take: first }),
    prisma.user.count({ where }),
  ])

  return { users, totalCount }
}

const findById = (id: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id } })
}

const findByEmail = (email: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { email } })
}

const create = (data: UserInput): Promise<User> => {
  // @ts-ignore
  return prisma.user.create({ data })
}

const update = (id: string, changes: Partial<UserInput>): Promise<User> => {
  return prisma.user.update({ where: { id }, data: changes })
}

const remove = async (id: string): Promise<void> => {
  await prisma.user.delete({ where: { id } })
}

export default { create, findByEmail, findById, findPage, remove, update }
