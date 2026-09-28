import { createRouter, createWebHistory } from 'vue-router'
import routeNames from '@/constants/routeNames'
import publicRoutes from './routes/public'
import secureRoutes from './routes/secure'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...publicRoutes,
    ...secureRoutes,
    {
      path: '/:pathMatch(.*)*',
      name: routeNames.NOT_FOUND,
      component: () => import('@/views/not-found/main-page/index.vue'),
    },
  ],
})

export default router
