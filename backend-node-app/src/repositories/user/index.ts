import { prisma } from '#db/client'
import type { User, UserInput } from '#types/user'

const findAll = (): Promise<User[]> => prisma.user.findMany({ orderBy: { createdAt: 'asc' } })

const findById = (id: string): Promise<User | null> => prisma.user.findUnique({ where: { id } })

const findByEmail = (email: string): Promise<User | null> =>
  prisma.user.findUnique({ where: { email } })

const create = (data: UserInput): Promise<User> => prisma.user.create({ data })

const update = (id: string, changes: Partial<UserInput>): Promise<User> =>
  prisma.user.update({ where: { id }, data: changes })

const remove = async (id: string): Promise<void> => {
  await prisma.user.delete({ where: { id } })
}

export default { create, findAll, findByEmail, findById, remove, update }
