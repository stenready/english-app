<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { rest } from '@/api'
import restUrls from '@/constants/restUrls'
import AppInput from '@/components/app/forms/AppInput.vue'
import AppTable from '@/components/app/AppTable.vue'
import IconSearch from '@/components/svg/IconSearch.vue'
import IconUsers from '@/components/svg/IconUsers.vue'
import {
  ruleMaxLength,
  ruleMinLength,
  ruleRequired,
} from '@/helpers/validationRules'
import type { AppTableColumn } from '@/types/table'
import type { User } from '@/types/user'

const PAGE_NAME = 'UsersListPage'

defineOptions({ name: PAGE_NAME })

const MAX_INITIALS = 2
const SEARCH_MIN_LENGTH = 3
const SEARCH_MAX_LENGTH = 50

const { t, locale } = useI18n()

const users = ref<User[]>([])
const isLoading = ref(true)
const hasError = ref(false)
const search = ref('')

const columns = computed<AppTableColumn[]>(() => [
  { key: 'member', label: t('users.list.columnMember') },
  { key: 'createdAt', label: t('users.list.columnJoined') },
])

const filteredUsers = computed<User[]>(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) return users.value

  return (users.value || []).filter(
    (user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query),
  )
})

const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, MAX_INITIALS)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString(locale.value)

onMounted(async () => {
  try {
    const { data } = await rest.get<{ data: User[] }>(restUrls.USERS)
    users.value = data
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <main :data-page-name="PAGE_NAME" class="mx-auto max-w-6xl px-6 py-8">
    <header>
      <h1 class="flex items-center gap-3 text-2xl font-bold">
        <IconUsers class="size-7 text-primary" />
        {{ t('users.list.title') }}
      </h1>
      <p class="mt-1 text-muted">{{ t('users.list.subtitle') }}</p>
    </header>

    <AppInput
      v-model="search"
      type="search"
      size="md"
      :clearable="true"
      class="mt-6"
      name="search"
      :placeholder="t('users.list.searchPlaceholder')"
      :rules="[
        ruleRequired,
        ruleMinLength(SEARCH_MIN_LENGTH),
        ruleMaxLength(SEARCH_MAX_LENGTH),
      ]"
    >
      <template #prevIcon>
        <IconSearch />
      </template>
    </AppInput>

    <AppTable
      class="mt-6"
      :columns="columns"
      :rows="filteredUsers"
      row-key="id"
    >
      <template #header>
        {{ t('users.list.count', { count: filteredUsers?.length }) }}
      </template>

      <template #cell-member="{ row }">
        <div class="flex items-center gap-3">
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
            aria-hidden="true"
          >
            {{ getInitials(row.name) }}
          </span>
          <div class="min-w-0">
            <div class="truncate font-medium">{{ row.name }}</div>
            <div class="truncate text-muted">{{ row.email }}</div>
          </div>
        </div>
      </template>

      <template #cell-createdAt="{ row }">
        <span class="text-muted">{{ formatDate(row.createdAt) }}</span>
      </template>

      <template #empty>
        <template v-if="isLoading">{{ t('users.list.loading') }}</template>
        <template v-else-if="hasError">{{
          t('users.list.loadError')
        }}</template>
        <template v-else>{{ t('users.list.empty') }}</template>
      </template>
    </AppTable>
  </main>
</template>
