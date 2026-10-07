import type { User } from '#generated/prisma/client'

export type { User }

export type UserInput = Pick<User, 'email' | 'name'>
