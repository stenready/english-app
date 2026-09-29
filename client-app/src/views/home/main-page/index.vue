<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const PAGE_NAME = 'HomeMainPage'

defineOptions({ name: PAGE_NAME })

const { t } = useI18n()
</script>

<template>
  <main :data-page-name="PAGE_NAME" class="px-4 py-10">
    <h1 class="text-3xl font-bold">{{ t('home.title') }}</h1>
  </main>
</template>
