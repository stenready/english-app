import 'vue-router'
import type { LayoutName } from '@/constants/layoutNames'
import type { Permission } from '@/constants/permissions'

// Typed route.meta for every route in the app
declare module 'vue-router' {
  interface RouteMeta {
    layout?: LayoutName
    permissions?: Permission[]
    isPrivate?: boolean
  }
}
