export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export type UserInput = Pick<User, 'email' | 'name'>
