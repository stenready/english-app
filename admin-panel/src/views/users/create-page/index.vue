<script setup lang="ts">
import { useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppButton from '@/components/app/AppButton.vue'
import AppCard from '@/components/app/AppCard.vue'
import IconPlus from '@/components/svg/IconPlus.vue'
import buttonVariants from '@/constants/buttonVariants'
import formModes from '@/constants/formModes'
import routeNames from '@/constants/routeNames'
import CreateOrEditUser from '@/views/users/_components/CreateOrEditUser.vue'

const PAGE_NAME = 'UsersCreatePage'

defineOptions({ name: PAGE_NAME })

const { t } = useI18n()
const router = useRouter()
// The submit button is in the header, outside the <form>: form="…" links them
const formId = useId()

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

      <template #actions>
        <AppButton
          data-name="user-create-cancel"
          :variant="buttonVariants.OUTLINE"
          @click="goToList"
        >
          {{ t('users.form.cancel') }}
        </AppButton>

        <AppButton data-name="user-create-submit" type="submit" :form="formId">
          {{ t('users.form.create') }}
        </AppButton>
      </template>

      <CreateOrEditUser
        :id="formId"
        :mode="formModes.CREATE"
        @saved="goToList"
      />
    </AppCard>
  </main>
</template>
