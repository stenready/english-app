<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import userStatuses, { type UserStatus } from '@/constants/userStatuses'

const COMPONENT_NAME = 'UserStatusBadge'

defineOptions({ name: COMPONENT_NAME })

const STATUS_CLASSES: Record<UserStatus, string> = {
  [userStatuses.ACTIVE]: 'bg-success/10 text-success',
  [userStatuses.PENDING]: 'bg-warning/10 text-warning',
  [userStatuses.BLOCKED]: 'bg-danger/10 text-danger',
}

const props = defineProps<{
  status: UserStatus
}>()

const { t } = useI18n()

const statusLabels = computed<Record<UserStatus, string>>(() => ({
  [userStatuses.ACTIVE]: t('users.status.active'),
  [userStatuses.PENDING]: t('users.status.pending'),
  [userStatuses.BLOCKED]: t('users.status.blocked'),
}))
</script>

<template>
  <span
    :data-component-name="COMPONENT_NAME"
    class="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
    :class="STATUS_CLASSES[props.status]"
  >
    <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
    {{ statusLabels[props.status] }}
  </span>
</template>
