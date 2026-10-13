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
    },
  },
]

export default secureRoutes
