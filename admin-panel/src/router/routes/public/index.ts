import type { RouteRecordRaw } from 'vue-router'
import HomeMainPage from '@/views/home/main-page/index.vue'
import routeNames from '@/constants/routeNames'
import layoutNames from '@/constants/layoutNames'
import permissions from '@/constants/permissions'

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: routeNames.HOME,
    component: HomeMainPage,
    meta: {
      layout: layoutNames.DASHBOARD,
      permissions: [],
      isPrivate: false,
    },
  },
  {
    path: '/about',
    name: routeNames.ABOUT,
    component: () => import('@/views/about/main-page/index.vue'),
    meta: {
      layout: layoutNames.DASHBOARD,
      permissions: [permissions.READ_ABOUT_PAGE, permissions.EDIT_ABOUT_PAGE],
      isPrivate: false,
    },
  },
]

export default publicRoutes
