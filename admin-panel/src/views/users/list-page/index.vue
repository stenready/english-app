<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import AppButton from '@/components/app/forms/AppButton.vue'
import AppInput from '@/components/app/forms/AppInput.vue'
import AppCard from '@/components/app/AppCard.vue'
import AppDropdown from '@/components/app/AppDropdown.vue'
import AppTable from '@/components/app/AppTable.vue'
import IconPlus from '@/components/svg/IconPlus.vue'
import IconSearch from '@/components/svg/IconSearch.vue'
import IconUsers from '@/components/svg/IconUsers.vue'
import { ruleMaxLength, ruleMinLength } from '@/helpers/validationRules'
import recordStatuses, { type RecordStatus } from '@/constants/recordStatuses'
import { userRecords } from '@/mocks/userRecords'
import type { AppDropdownItem } from '@/types/dropdown'
import type { AppTableColumn } from '@/types/table'
import type { UserRecord } from '@/types/userRecord'

const PAGE_NAME = 'UsersListPage'

defineOptions({ name: PAGE_NAME })

const SEARCH_MIN_LENGTH = 3
const SEARCH_MAX_LENGTH = 50
const SECRET_MASK_CHAR = '•'
const INITIALS_COUNT = 2
const USER_NAME_SEPARATOR = /[.\s_-]+/

const recordActions = {
  VIEW: 'view',
  EDIT: 'edit',
  DELETE: 'delete',
} as const

type RecordAction = (typeof recordActions)[keyof typeof recordActions]

const STATUS_CLASSES: Record<RecordStatus, string> = {
  [recordStatuses.ACTIVE]: 'bg-primary/10 text-primary',
  [recordStatuses.PENDING]: 'bg-warning/10 text-warning',
  [recordStatuses.BLOCKED]: 'bg-danger/10 text-danger',
}

const { t, locale } = useI18n()

const search = ref('')
// The table filters by the applied query: it changes only on submit (button / Enter)
const appliedSearch = ref('')

const { handleSubmit } = useForm()

const demoColumns = computed<AppTableColumn[]>(() => [
  { key: 'id', label: t('users.demo.columnId') },
  { key: 'userName', label: t('users.demo.columnUserName') },
  { key: 'status', label: t('users.demo.columnStatus') },
  { key: 'description', label: t('users.demo.columnDescription') },
  { key: 'hash', label: t('users.demo.columnHash') },
  { key: 'secretWord', label: t('users.demo.columnSecretWord') },
  { key: 'email', label: t('users.demo.columnEmail') },
  { key: 'role', label: t('users.demo.columnRole') },
  { key: 'country', label: t('users.demo.columnCountry') },
  { key: 'ipAddress', label: t('users.demo.columnIpAddress') },
  { key: 'createdAt', label: t('users.demo.columnCreatedAt') },
  { key: 'lastLoginAt', label: t('users.demo.columnLastLoginAt') },
  {
    key: 'actions',
    label: t('users.demo.columnActions'),
    isSticky: true,
    thClassName: 'text-center',
  },
])

const statusLabels = computed<Record<RecordStatus, string>>(() => ({
  [recordStatuses.ACTIVE]: t('users.demo.statusActive'),
  [recordStatuses.PENDING]: t('users.demo.statusPending'),
  [recordStatuses.BLOCKED]: t('users.demo.statusBlocked'),
}))

const recordActionItems = computed<AppDropdownItem<RecordAction>[]>(() => [
  { key: recordActions.VIEW, label: t('users.demo.actionView') },
  { key: recordActions.EDIT, label: t('users.demo.actionEdit') },
  {
    key: recordActions.DELETE,
    label: t('users.demo.actionDelete'),
    danger: true,
  },
])

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString(locale.value)

const formatDateTime = (value: string): string =>
  new Date(value).toLocaleString(locale.value)

// Blocked records get a light danger tint
const getRecordRowClass = (record: UserRecord): string | undefined =>
  record.status === recordStatuses.BLOCKED ? 'bg-danger/5' : undefined

// "stas.radchenko" → "sr"
const getInitials = (userName: string): string =>
  userName
    .split(USER_NAME_SEPARATOR)
    .slice(0, INITIALS_COUNT)
    .map((part) => part.charAt(0))
    .join('')

const maskSecret = (value: string): string =>
  SECRET_MASK_CHAR.repeat(value.length)

const filteredRecords = computed<UserRecord[]>(() => {
  const query = appliedSearch.value.trim().toLowerCase()

  if (!query) return userRecords

  return userRecords.filter((record) =>
    record.userName.toLowerCase().includes(query),
  )
})

// Runs only when the search rules pass
const applySearch = handleSubmit(() => {
  appliedSearch.value = search.value
})

const resetSearch = (): void => {
  appliedSearch.value = ''
}
</script>

<template>
  <main :data-page-name="PAGE_NAME">
    <AppCard
      :title="t('users.list.title')"
      :description="t('users.list.subtitle')"
    >
      <template #icon>
        <IconUsers />
      </template>

      <template #actions>
        <AppButton>
          <IconPlus />
          {{ t('users.list.addUser') }}
        </AppButton>
      </template>

      <form class="flex items-start gap-3" @submit.prevent="applySearch">
        <AppInput
          v-model="search"
          type="search"
          size="md"
          :clearable="true"
          class="flex-1"
          name="search"
          :placeholder="t('users.list.searchPlaceholder')"
          :rules="[
            ruleMinLength(SEARCH_MIN_LENGTH),
            ruleMaxLength(SEARCH_MAX_LENGTH),
          ]"
          @clear="resetSearch"
        >
          <template #prevIcon>
            <IconSearch />
          </template>
        </AppInput>

        <AppButton variant="outline-primary" type="submit">{{
          t('users.list.searchButton')
        }}</AppButton>
      </form>
      <AppTable
        class="mt-6"
        :columns="demoColumns"
        :rows="filteredRecords"
        row-key="id"
        :tbody-tr-class="getRecordRowClass"
      >
        <template #header>
          {{ t('users.demo.title', { count: filteredRecords.length }) }}
        </template>

        <template #cell-id="{ row }">
          <span class="font-mono text-xs text-muted">#{{ row.id }}</span>
        </template>

        <template #cell-userName="{ row }">
          <div class="flex items-center gap-3 whitespace-nowrap">
            <span
              class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary uppercase"
              aria-hidden="true"
            >
              {{ getInitials(row.userName) }}
            </span>
            <span class="font-medium">{{ row.userName }}</span>
          </div>
        </template>

        <template #cell-status="{ row }">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
            :class="STATUS_CLASSES[row.status]"
          >
            <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
            {{ statusLabels[row.status] }}
          </span>
        </template>

        <template #cell-description="{ row }">
          <p class="line-clamp-2 max-w-sm min-w-64 text-muted">
            {{ row.description }}
          </p>
        </template>

        <template #cell-hash="{ row }">
          <code
            class="rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-xs whitespace-nowrap text-muted"
            >{{ row.hash }}</code
          >
        </template>

        <template #cell-secretWord="{ row }">
          <span
            class="font-mono tracking-widest text-muted"
            :aria-label="t('users.demo.secretHidden')"
          >
            {{ maskSecret(row.secretWord) }}
          </span>
        </template>

        <template #cell-email="{ row }">
          <span class="whitespace-nowrap">{{ row.email }}</span>
        </template>

        <template #cell-role="{ row }">
          <span class="whitespace-nowrap capitalize">{{ row.role }}</span>
        </template>

        <template #cell-ipAddress="{ row }">
          <code class="font-mono text-xs whitespace-nowrap">{{
            row.ipAddress
          }}</code>
        </template>

        <template #cell-createdAt="{ row }">
          <span class="whitespace-nowrap text-muted">{{
            formatDate(row.createdAt)
          }}</span>
        </template>

        <template #cell-lastLoginAt="{ row }">
          <span class="whitespace-nowrap text-muted">{{
            formatDateTime(row.lastLoginAt)
          }}</span>
        </template>

        <template #cell-actions>
          <div class="flex justify-end">
            <AppDropdown
              :items="recordActionItems"
              :label="t('users.demo.columnActions')"
            />
          </div>
        </template>

        <template #empty>{{ t('users.list.empty') }}</template>
      </AppTable>
    </AppCard>
  </main>
</template>
