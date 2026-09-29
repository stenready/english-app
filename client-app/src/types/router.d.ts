import 'vue-router'
import type { LayoutName } from '@/constants/layoutNames'

// Typed route.meta for every route in the app
declare module 'vue-router' {
  interface RouteMeta {
    layout?: LayoutName
    isPrivate?: boolean
  }
}
