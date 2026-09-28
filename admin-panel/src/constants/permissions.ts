const permissions = {
  READ_ABOUT_PAGE: 'read_about_page',
  EDIT_ABOUT_PAGE: 'edit_about_page',
} as const

export type Permission = (typeof permissions)[keyof typeof permissions]

export default permissions
