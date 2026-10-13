<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppCard from '@/components/app/AppCard.vue'
import routeNames from '@/constants/routeNames'

const PAGE_NAME = 'NotFoundMainPage'

defineOptions({ name: PAGE_NAME })

const { t } = useI18n()
</script>

<template>
  <main :data-page-name="PAGE_NAME">
    <AppCard
      :title="t('notFound.title')"
      :description="t('notFound.description')"
    >
      <RouterLink
        :to="{ name: routeNames.HOME }"
        class="inline-block underline"
      >
        {{ t('notFound.backHome') }}
      </RouterLink>
    </AppCard>
  </main>
</template>
