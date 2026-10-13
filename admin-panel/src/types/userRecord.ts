import type { RecordStatus } from '@/constants/recordStatuses'

// Demo model for the table (mock data, not from the server)
export interface UserRecord {
  id: number
  userName: string
  status: RecordStatus
  description: string
  hash: string
  secretWord: string
  email: string
  role: string
  country: string
  ipAddress: string
  // ISO 8601
  createdAt: string
  lastLoginAt: string
}
