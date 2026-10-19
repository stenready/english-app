<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppCard from '@/components/app/AppCard.vue'
import IconPencil from '@/components/svg/IconPencil.vue'
import formModes from '@/constants/formModes'
import routeNames from '@/constants/routeNames'
import CreateOrEditUser from '@/views/users/_components/CreateOrEditUser.vue'

const PAGE_NAME = 'UsersEditPage'

defineOptions({ name: PAGE_NAME })

// From the route /users/:id/edit (props: true)
const props = defineProps<{
  id: string
}>()

const { t } = useI18n()
const router = useRouter()

const goToList = (): void => {
  router.push({ name: routeNames.USERS })
}
</script>

<template>
  <main :data-page-name="PAGE_NAME">
    <AppCard
      :title="t('users.form.editTitle')"
      :description="t('users.form.editSubtitle')"
    >
      <template #icon>
        <IconPencil />
      </template>

      <!-- key: another id in the URL reloads the form -->
      <CreateOrEditUser
        :key="props.id"
        :mode="formModes.EDIT"
        :user-id="props.id"
        @saved="goToList"
        @cancel="goToList"
      />
    </AppCard>
  </main>
</template>
