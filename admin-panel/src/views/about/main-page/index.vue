<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const PAGE_NAME = 'AboutMainPage'

defineOptions({ name: PAGE_NAME })

const { t } = useI18n()
</script>

<template>
  <main :data-page-name="PAGE_NAME" class="mx-auto max-w-5xl px-6 py-16">
    <h1 class="text-3xl font-bold">{{ t('about.title') }}</h1>
  </main>
</template>
