import type { RouteRecordRaw } from 'vue-router'
import HomeMainPage from '@/views/home/main-page/index.vue'
import routeNames from '@/constants/routeNames'
import layoutNames from '@/constants/layoutNames'

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: routeNames.HOME,
    component: HomeMainPage,
    meta: {
      layout: layoutNames.MAIN,
      isPrivate: false,
    },
  },
]

export default publicRoutes
