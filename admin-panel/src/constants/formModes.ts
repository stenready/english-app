// One form for both: CreateOrEdit… components switch on it
const formModes = {
  CREATE: 'create',
  EDIT: 'edit',
} as const

export type FormMode = (typeof formModes)[keyof typeof formModes]

export default formModes
