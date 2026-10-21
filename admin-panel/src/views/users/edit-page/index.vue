<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppButton from '@/components/app/AppButton.vue'
import AppCard from '@/components/app/AppCard.vue'
import IconLock from '@/components/svg/IconLock.vue'
import IconLockOpen from '@/components/svg/IconLockOpen.vue'
import IconPencil from '@/components/svg/IconPencil.vue'
import IconTrash from '@/components/svg/IconTrash.vue'
import buttonVariants from '@/constants/buttonVariants'
import formModes from '@/constants/formModes'
import routeNames from '@/constants/routeNames'
import userStatuses from '@/constants/userStatuses'
import ConfirmBlockOrUnblockModal from '@/views/users/_components/ConfirmBlockOrUnblockModal.vue'
import CreateOrEditUser from '@/views/users/_components/CreateOrEditUser.vue'
import { useDeleteUser } from '@/views/users/_use/useDeleteUser'
import type { User } from '@/types/user'

const PAGE_NAME = 'UsersEditPage'

defineOptions({ name: PAGE_NAME })

// From the route /users/:id/edit (props: true)
const props = defineProps<{
  id: string
}>()

const { t } = useI18n()
const router = useRouter()
const { deleteUser } = useDeleteUser()
// The submit button is in the header, outside the <form>: form="…" links them
const formId = useId()

// From the form once it loads: the delete button needs it
const user = ref<User | null>(null)
const isStatusModalOpen = ref(false)
// A new key remounts the form: it loads the user again with the new status
const formVersion = ref(0)

const isBlocked = computed<boolean>(() => {
  return user.value?.status === userStatuses.BLOCKED
})

const setUser = (value: User): void => {
  user.value = value
}

const goToList = (): void => {
  router.push({ name: routeNames.USERS })
}

// Unsaved changes in the form are dropped: it shows the user as saved
const reloadForm = (): void => {
  formVersion.value++
}

const removeUser = async (): Promise<void> => {
  if (!user.value) return

  const isDeleted = await deleteUser(user.value)

  if (isDeleted) goToList()
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

      <template #actions>
        <template v-if="user">
          <AppButton
            data-name="user-block-toggle"
            :variant="
              isBlocked ? buttonVariants.OUTLINE : buttonVariants.OUTLINE_DANGER
            "
            @click="isStatusModalOpen = true"
          >
            <IconLockOpen v-if="isBlocked" />
            <IconLock v-else />
            {{
              isBlocked
                ? t('users.list.actionUnblock')
                : t('users.list.actionBlock')
            }}
          </AppButton>
          <AppButton
            data-name="user-delete"
            :variant="buttonVariants.OUTLINE_DANGER"
            @click="removeUser"
          >
            <IconTrash />
            {{ t('users.list.actionDelete') }}
          </AppButton>
          <span class="mx-1 h-6 w-px bg-border" aria-hidden="true" />
        </template>
        <AppButton
          data-name="user-edit-cancel"
          :variant="buttonVariants.OUTLINE"
          @click="goToList"
        >
          {{ t('users.form.cancel') }}
        </AppButton>
        <!-- Only once loaded: an empty form must not be submitted -->
        <AppButton
          data-name="user-edit-submit"
          type="submit"
          :form="formId"
          :disabled="!user"
        >
          {{ t('users.form.save') }}
        </AppButton>
      </template>

      <!-- key: another id in the URL or a status change reloads the form -->
      <CreateOrEditUser
        :id="formId"
        :key="`${props.id}-${formVersion}`"
        :mode="formModes.EDIT"
        :user-id="props.id"
        @saved="goToList"
        @loaded="setUser"
      />
    </AppCard>

    <ConfirmBlockOrUnblockModal
      v-model="isStatusModalOpen"
      :user="user"
      @success="reloadForm"
    />
  </main>
</template>
