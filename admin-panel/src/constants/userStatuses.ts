// Same values as the backend UserStatus enum
const userStatuses = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  BLOCKED: 'BLOCKED',
} as const

export type UserStatus = (typeof userStatuses)[keyof typeof userStatuses]

export default userStatuses
