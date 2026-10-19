<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { useGlobalModal } from '@/use/useGlobalModal'
import { useLoader } from '@/use/useLoader'
import { rest } from '@/api'
import AppButton from '@/components/app/AppButton.vue'
import AppInput from '@/components/app/forms/AppInput.vue'
import AppCard from '@/components/app/AppCard.vue'
import AppDropdown from '@/components/app/AppDropdown.vue'
import AppTable from '@/components/app/AppTable.vue'
import IconPencil from '@/components/svg/IconPencil.vue'
import IconPlus from '@/components/svg/IconPlus.vue'
import IconTrash from '@/components/svg/IconTrash.vue'
import IconSearch from '@/components/svg/IconSearch.vue'
import IconUsers from '@/components/svg/IconUsers.vue'
import { ruleMaxLength, ruleMinLength } from '@/helpers/validationRules'
import { processingError } from '@/helpers/apiErrors'
import { dateFormats, formatDate } from '@/helpers/date'
import buttonVariants from '@/constants/buttonVariants'
import restUrls from '@/constants/restUrls'
import routeNames from '@/constants/routeNames'
import userStatuses, { type UserStatus } from '@/constants/userStatuses'
import type { AppDropdownItem } from '@/types/dropdown'
import { DEFAULT_TABLE_FIRST } from '@/constants/tablePagination'
import type { AppTableColumn, AppTablePagination } from '@/types/table'
import type { PageResponse } from '@/types/pagination'
import type { User } from '@/types/user'
import modalPositions from '@/constants/modalPositions'

const PAGE_NAME = 'UsersListPage'

defineOptions({ name: PAGE_NAME })

const SEARCH_MIN_LENGTH = 3
const SEARCH_MAX_LENGTH = 50
const INITIALS_COUNT = 2
const USER_NAME_SEPARATOR = /[.\s_-]+/

const recordActions = {
  EDIT: 'edit',
  DELETE: 'delete',
} as const

type RecordAction = (typeof recordActions)[keyof typeof recordActions]

const STATUS_CLASSES: Record<UserStatus, string> = {
  [userStatuses.ACTIVE]: 'bg-success/10 text-success',
  [userStatuses.PENDING]: 'bg-warning/10 text-warning',
  [userStatuses.BLOCKED]: 'bg-danger/10 text-danger',
}

const { t } = useI18n()
const router = useRouter()

const { handleSubmit, resetForm } = useForm()

const { startLoading, stopLoading } = useLoader()
const { showModal } = useGlobalModal()

const filters = ref({ search: '' })
const pagination = ref<AppTablePagination>({
  first: DEFAULT_TABLE_FIRST,
  skip: 0,
  sortKey: undefined,
  reverse: undefined,
})

// Current page from the server: already filtered and cut by first/skip
const records = ref<User[]>([])
// Found users in total: the table counts pages from it
const totalCount = ref(0)
// Not sortable: the API has no sorting yet
const columns = computed<AppTableColumn[]>(() => [
  { key: 'name', label: t('users.list.columnUser') },
  { key: 'email', label: t('users.list.columnEmail') },
  { key: 'status', label: t('users.list.columnStatus') },
  { key: 'createdAt', label: t('users.list.columnCreatedAt') },
  { key: 'updatedAt', label: t('users.list.columnUpdatedAt') },
  {
    key: 'actions',
    label: t('users.list.columnActions'),
    isSticky: true,
    thClassName: 'text-center w-4',
  },
])

const statusLabels = computed<Record<UserStatus, string>>(() => ({
  [userStatuses.ACTIVE]: t('users.status.active'),
  [userStatuses.PENDING]: t('users.status.pending'),
  [userStatuses.BLOCKED]: t('users.status.blocked'),
}))

const recordActionItems = computed<AppDropdownItem<RecordAction>[]>(() => [
  {
    key: recordActions.EDIT,
    label: t('users.list.actionEdit'),
    icon: IconPencil,
    isShow: true,
  },
  {
    key: recordActions.DELETE,
    label: t('users.list.actionDelete'),
    icon: IconTrash,
    danger: true,
    isShow: true,
  },
])

// Add new filters to the list
const activeFiltersCount = computed<number>(
  () => [filters.value.search.trim()].filter(Boolean).length,
)

// Blocked users get a light danger tint
const getRecordRowClass = (record: User): string | undefined => {
  return record.status === userStatuses.BLOCKED ? 'bg-danger/5' : undefined
}

const getInitials = (name: string): string => {
  return name
    .split(USER_NAME_SEPARATOR)
    .slice(0, INITIALS_COUNT)
    .map((part) => part.charAt(0))
    .join('')
}

const goToEdit = (record: User): void => {
  router.push({
    name: routeNames.USERS_EDIT,
    params: { id: record.id },
  })
}

const goToCreate = (): void => {
  router.push({ name: routeNames.USERS_CREATE })
}

const onPagination = (value: AppTablePagination): void => {
  pagination.value = value
  getList()
}

// Any filter change (search, reset, future filters) starts from the first page
const applyFilters = (): void => {
  pagination.value = { ...pagination.value, skip: 0 }
  getList()
}

const resetFilters = (): void => {
  filters.value.search = ''
  resetForm()
  applyFilters()
}

const getList = async (): Promise<void> => {
  startLoading()

  try {
    const { first, skip } = pagination.value
    const { data, meta } = await rest.get<PageResponse<User>>(restUrls.USERS, {
      // Empty search is left out: the server would treat it as no search anyway
      query: { first, skip, search: filters.value.search.trim() || undefined },
    })

    records.value = data
    totalCount.value = meta.totalCount
  } catch (error) {
    records.value = []
    totalCount.value = 0
    processingError(error, { showToast: true })
  } finally {
    stopLoading()
  }
}

const deleteUser = async (record: User): Promise<void> => {
  const isConfirmed = await showModal({
    title: t('users.delete.title'),
    description: t('users.delete.description', { name: record.name }),
    confirmText: t('users.list.actionDelete'),
    confirmVariant: buttonVariants.DANGER,
    name: 'delete-user',
    position: modalPositions.TOP,
  })

  if (!isConfirmed) return

  startLoading()

  try {
    await rest.delete(restUrls.USER(record.id))
    // The last user of a page: AppTable steps back a page by itself
    await getList()
  } catch (error) {
    processingError(error, { showToast: true })
  } finally {
    stopLoading()
  }
}

// Runs only when the search rules pass
const applySearch = handleSubmit(applyFilters)

onMounted(() => {
  getList()
})
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
        <AppButton @click="goToCreate">
          <IconPlus />
          {{ t('users.list.addUser') }}
        </AppButton>
      </template>

      <AppTable
        :columns="columns"
        :rows="records"
        row-key="id"
        :tbody-tr-class="getRecordRowClass"
        sticky-header
        :total-rows="totalCount"
        is-show-first-selector
        is-show-pagination
        :filters-count="activeFiltersCount"
        :pagination="pagination"
        @reset-filters="resetFilters"
        @update:pagination="onPagination"
      >
        <template #header>
          {{ t('users.list.count', { count: totalCount }) }}
        </template>

        <template #filters>
          <form class="flex items-start gap-3" @submit.prevent="applySearch">
            <AppInput
              v-model="filters.search"
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
              @clear="applyFilters"
            >
              <template #prevIcon>
                <IconSearch />
              </template>
            </AppInput>

            <AppButton variant="outline-primary" type="submit">{{
              t('users.list.searchButton')
            }}</AppButton>
          </form>
        </template>

        <template #cell-name="{ row }">
          <div class="flex items-center gap-3 whitespace-nowrap">
            <img
              v-if="row.avatarUrl"
              :src="row.avatarUrl"
              alt=""
              class="size-8 shrink-0 rounded-full object-cover"
            />
            <span
              v-else
              class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary uppercase"
              aria-hidden="true"
            >
              {{ getInitials(row.name) }}
            </span>
            <span class="font-medium">{{ row.name }}</span>
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

        <template #cell-email="{ row }">
          <span class="whitespace-nowrap">{{ row.email }}</span>
        </template>

        <template #cell-createdAt="{ row }">
          <span class="whitespace-nowrap text-muted">{{
            formatDate(row.createdAt)
          }}</span>
        </template>

        <template #cell-updatedAt="{ row }">
          <span class="whitespace-nowrap text-muted">{{
            formatDate(row.updatedAt, dateFormats.DATE_TIME)
          }}</span>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex justify-end">
            <AppDropdown
              :items="recordActionItems"
              :label="t('users.list.columnActions')"
              :payload="row"
              @edit="goToEdit"
              @delete="deleteUser"
            />
          </div>
        </template>

        <template #empty>{{ t('users.list.empty') }}</template>
      </AppTable>
    </AppCard>
  </main>
</template>
