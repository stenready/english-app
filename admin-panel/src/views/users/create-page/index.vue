<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppCard from '@/components/app/AppCard.vue'
import IconPlus from '@/components/svg/IconPlus.vue'
import formModes from '@/constants/formModes'
import routeNames from '@/constants/routeNames'
import CreateOrEditUser from '@/views/users/_components/CreateOrEditUser.vue'

const PAGE_NAME = 'UsersCreatePage'

defineOptions({ name: PAGE_NAME })

const { t } = useI18n()
const router = useRouter()

const goToList = (): void => {
  router.push({ name: routeNames.USERS })
}
</script>

<template>
  <main :data-page-name="PAGE_NAME">
    <AppCard
      :title="t('users.form.createTitle')"
      :description="t('users.form.createSubtitle')"
    >
      <template #icon>
        <IconPlus />
      </template>

      <CreateOrEditUser
        :mode="formModes.CREATE"
        @saved="goToList"
        @cancel="goToList"
      />
    </AppCard>
  </main>
</template>
