import type { RouteLocationRaw } from 'vue-router'

// In route.meta: the title is an i18n key, so crumbs follow the current language
export interface RouteBreadcrumb {
  titleKey: string
  // No link: the current page (the last crumb)
  to?: RouteLocationRaw
}

// What AppBreadcrumbs renders: already translated
export interface AppBreadcrumb {
  title: string
  to?: RouteLocationRaw
}
