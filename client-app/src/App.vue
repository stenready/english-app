<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="border-b border-slate-200 px-6 py-4">
    <nav class="mx-auto flex max-w-5xl gap-4" aria-label="Основная навигация">
      <RouterLink to="/">Главная</RouterLink>
      <RouterLink to="/about">О проекте</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>
