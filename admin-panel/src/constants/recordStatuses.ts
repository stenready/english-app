const recordStatuses = {
  ACTIVE: 'active',
  PENDING: 'pending',
  BLOCKED: 'blocked',
} as const

export type RecordStatus = (typeof recordStatuses)[keyof typeof recordStatuses]

export default recordStatuses
