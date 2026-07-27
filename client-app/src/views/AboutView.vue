<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <main data-page-name="AboutViewPage" class="mx-auto max-w-5xl px-6 py-16">
    <h1 class="text-3xl font-bold">{{ t('about.title') }}</h1>
  </main>
</template>
