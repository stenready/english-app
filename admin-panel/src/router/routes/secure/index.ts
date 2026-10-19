import type { RouteRecordRaw } from 'vue-router'
import routeNames from '@/constants/routeNames'
import layoutNames from '@/constants/layoutNames'
import permissions from '@/constants/permissions'

const secureRoutes: RouteRecordRaw[] = [
  {
    path: '/users',
    name: routeNames.USERS,
    component: () => import('@/views/users/list-page/index.vue'),
    meta: {
      layout: layoutNames.DASHBOARD,
      permissions: [permissions.READ_USERS_PAGE],
      isPrivate: true,
      breadcrumbs: [{ titleKey: 'navigation.users' }],
    },
  },
  {
    path: '/users/create',
    name: routeNames.USERS_CREATE,
    component: () => import('@/views/users/create-page/index.vue'),
    meta: {
      layout: layoutNames.DASHBOARD,
      permissions: [permissions.CREATE_USERS],
      isPrivate: true,
      breadcrumbs: [
        { titleKey: 'navigation.users', to: { name: routeNames.USERS } },
        { titleKey: 'users.form.createTitle' },
      ],
    },
  },
  {
    path: '/users/:id/edit',
    name: routeNames.USERS_EDIT,
    component: () => import('@/views/users/edit-page/index.vue'),
    // :id comes to the page as a prop
    props: true,
    meta: {
      layout: layoutNames.DASHBOARD,
      permissions: [permissions.EDIT_USERS],
      isPrivate: true,
      breadcrumbs: [
        { titleKey: 'navigation.users', to: { name: routeNames.USERS } },
        { titleKey: 'users.form.editTitle' },
      ],
    },
  },
]

export default secureRoutes
