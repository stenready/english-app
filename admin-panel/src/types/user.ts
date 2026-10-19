import type { UserStatus } from '@/constants/userStatuses'

// Mirrors the server's User model (GET /users)
export interface User {
  id: string
  email: string
  name: string
  // S3 key from POST /uploads/images; null: no avatar
  avatarKey: string | null
  // Ready link to the avatar, built by the server from avatarKey
  avatarUrl: string | null
  status: UserStatus
  roleId: string | null
  createdAt: string
  updatedAt: string
}
