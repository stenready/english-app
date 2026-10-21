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
  // The full-size copy: for viewing
  avatarOriginalUrl: string | null
  status: UserStatus
  // Why the user was blocked; null for any other status
  blockReason: string | null
  roleId: string | null
  createdAt: string
  updatedAt: string
}
