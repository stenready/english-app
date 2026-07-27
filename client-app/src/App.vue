<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n({ useScope: 'global' })
</script>

<template>
  <div data-component-name="App">
    <header class="border-b border-slate-200 px-6 py-4">
      <nav
        class="mx-auto flex max-w-5xl items-center gap-4"
        :aria-label="t('navigation.main')"
      >
        <RouterLink to="/">{{ t('navigation.home') }}</RouterLink>
        <RouterLink to="/about">{{ t('navigation.about') }}</RouterLink>

        <label class="ml-auto flex items-center gap-2" for="locale">
          <span class="sr-only">{{ t('navigation.language') }}</span>
          <select id="locale" v-model="locale" class="rounded border border-slate-300 px-2 py-1">
            <option value="ru">Русский</option>
            <option value="uk">Українська</option>
            <option value="en">English</option>
          </select>
        </label>
      </nav>
    </header>

    <RouterView />
  </div>
</template>
