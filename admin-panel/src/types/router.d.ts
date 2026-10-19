import 'vue-router'
import type { LayoutName } from '@/constants/layoutNames'
import type { Permission } from '@/constants/permissions'
import type { RouteBreadcrumb } from '@/types/breadcrumbs'

// Typed route.meta for every route in the app
declare module 'vue-router' {
  interface RouteMeta {
    layout?: LayoutName
    permissions?: Permission[]
    isPrivate?: boolean
    // Shown in the top bar after "Home"; none: no breadcrumbs on the page
    breadcrumbs?: RouteBreadcrumb[]
  }
}
