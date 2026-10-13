<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppCard from '@/components/app/AppCard.vue'

const PAGE_NAME = 'AboutMainPage'

defineOptions({ name: PAGE_NAME })

const { t } = useI18n()
</script>

<template>
  <main :data-page-name="PAGE_NAME">
    <AppCard :title="t('about.title')" />
  </main>
</template>
