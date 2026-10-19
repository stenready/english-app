const permissions = {
  READ_ABOUT_PAGE: 'read_about_page',
  EDIT_ABOUT_PAGE: 'edit_about_page',
  READ_USERS_PAGE: 'read_users_page',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
} as const

export type Permission = (typeof permissions)[keyof typeof permissions]

export default permissions
