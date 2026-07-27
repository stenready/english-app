import { createRouter, createWebHistory } from 'vue-router'
import HomeView from "@/views/HomeView.vue";
import routeNames from "@/constants/routeNames.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: routeNames.HOME,
      component: HomeView,
    },
    {
      path: '/about',
      name: routeNames.ABOUT,
      component: () => import('@/views/AboutView.vue'),
    },
  ],
})

export default router
