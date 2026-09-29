<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import routeNames from '@/constants/routeNames'

const PAGE_NAME = 'NotFoundMainPage'

defineOptions({ name: PAGE_NAME })

const { t } = useI18n()
</script>

<template>
  <main :data-page-name="PAGE_NAME" class="px-4 py-10">
    <h1 class="text-3xl font-bold">{{ t('notFound.title') }}</h1>
    <p class="mt-4">{{ t('notFound.description') }}</p>
    <RouterLink
      :to="{ name: routeNames.HOME }"
      class="mt-6 inline-block underline"
    >
      {{ t('notFound.backHome') }}
    </RouterLink>
  </main>
</template>
