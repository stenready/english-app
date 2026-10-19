<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import IconChevronDown from '@/components/svg/IconChevronDown.vue'
import type { AppBreadcrumb } from '@/types/breadcrumbs'

const COMPONENT_NAME = 'AppBreadcrumbs'

defineOptions({ name: COMPONENT_NAME })

const props = defineProps<{
  items: AppBreadcrumb[]
}>()

const { t } = useI18n()

const isLast = (index: number): boolean => {
  return index === props.items.length - 1
}
</script>

<template>
  <nav
    v-if="props.items.length"
    :data-component-name="COMPONENT_NAME"
    :aria-label="t('navigation.breadcrumbs')"
  >
    <ol class="flex min-w-0 items-center gap-1.5 text-sm">
      <li
        v-for="(item, index) in props.items"
        :key="index"
        class="flex min-w-0 items-center gap-1.5"
      >
        <!-- The current page is plain text: a link to itself is useless -->
        <span
          v-if="isLast(index) || !item.to"
          class="truncate font-medium text-foreground"
          :aria-current="isLast(index) ? 'page' : undefined"
        >
          {{ item.title }}
        </span>
        <RouterLink
          v-else
          :to="item.to"
          class="truncate rounded text-muted transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {{ item.title }}
        </RouterLink>

        <IconChevronDown
          v-if="!isLast(index)"
          class="size-3.5 shrink-0 -rotate-90 text-muted"
        />
      </li>
    </ol>
  </nav>
</template>
