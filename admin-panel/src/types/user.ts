// Mirrors the server's User model (GET /users)
export interface User {
  id: string
  email: string
  name: string
  roleId: string | null
  createdAt: string
  updatedAt: string
}
