<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { rest } from '@/api'
import AppImageUpload from '@/components/app/forms/AppImageUpload.vue'
import AppInput from '@/components/app/forms/AppInput.vue'
import AppTextArea from '@/components/app/forms/AppTextArea.vue'
import formModes, { type FormMode } from '@/constants/formModes'
import restUrls from '@/constants/restUrls'
import uploadFolders from '@/constants/uploadFolders'
import uploadModes from '@/constants/uploadModes'
import userStatuses, { type UserStatus } from '@/constants/userStatuses'
import { processingError } from '@/helpers/apiErrors'
import {
  ruleEmail,
  ruleMaxLength,
  ruleMinLength,
  ruleRequired,
} from '@/helpers/validationRules'
import { useLoader } from '@/use/useLoader'
import type { User } from '@/types/user'
import type { ValidationRule } from '@/types/validation'
import UserStatusBadge from '@/views/users/_components/UserStatusBadge.vue'

const COMPONENT_NAME = 'CreateOrEditUser'

defineOptions({ name: COMPONENT_NAME })

// Same limits as the backend userInputSchema
const NAME_MIN_LENGTH = 2
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128
const BLOCK_REASON_MAX_LENGTH = 500

interface UserForm {
  name: string
  email: string
  password: string
  avatarKey: string | null
  // Edited only while the user is blocked
  blockReason: string
}

// The status is shown, not edited here: it is sent only to keep the block reason
type UserBody = Partial<UserForm> & { status?: UserStatus }

const props = defineProps<{
  mode: FormMode
  // Required in edit mode: the user to load and save
  userId?: string
}>()

const emit = defineEmits<{
  saved: [user: User]
  // Edit mode: the user is loaded (e.g. the page shows a delete button for it)
  loaded: [user: User]
}>()

const { t } = useI18n()
const { handleSubmit } = useForm()
const { startLoading, stopLoading } = useLoader()
const avatarUpload =
  useTemplateRef<InstanceType<typeof AppImageUpload>>('avatarUpload')

const form = ref<UserForm>({
  name: '',
  email: '',
  password: '',
  avatarKey: null,
  blockReason: '',
})
// Edit mode: the loaded status; null in create mode
const status = ref<UserStatus | null>(null)
// Link to the saved avatar: only for showing it, the server takes avatarKey
const avatarUrl = ref<string | null>(null)
const avatarOriginalUrl = ref<string | null>(null)

const isEdit = computed<boolean>(() => {
  return props.mode === formModes.EDIT
})

const isBlocked = computed<boolean>(() => {
  return status.value === userStatuses.BLOCKED
})

// Edit: an empty password keeps the current one, so it is not required
const passwordRules = computed<ValidationRule[]>(() => {
  const lengthRules = [
    ruleMinLength(PASSWORD_MIN_LENGTH),
    ruleMaxLength(PASSWORD_MAX_LENGTH),
  ]

  return isEdit.value ? lengthRules : [ruleRequired, ...lengthRules]
})

const getBody = (): UserBody => {
  const { name, email, password, avatarKey, blockReason } = form.value
  const body: UserBody = { name, email, avatarKey }

  if (!isEdit.value || password) body.password = password

  // The backend takes a reason only together with the BLOCKED status
  if (isBlocked.value) {
    body.status = userStatuses.BLOCKED
    body.blockReason = blockReason.trim()
  }

  return body
}

const loadUser = async (): Promise<void> => {
  if (!props.userId) return

  startLoading()

  try {
    const { data } = await rest.get<{ data: User }>(restUrls.USER(props.userId))

    form.value = {
      name: data.name,
      email: data.email,
      password: '',
      avatarKey: data.avatarKey,
      blockReason: data.blockReason ?? '',
    }
    status.value = data.status
    avatarUrl.value = data.avatarUrl
    avatarOriginalUrl.value = data.avatarOriginalUrl
    emit('loaded', data)
  } catch (error) {
    processingError(error, { showToast: true })
  } finally {
    stopLoading()
  }
}

const save = async (): Promise<void> => {
  startLoading()

  try {
    // The chosen avatar goes to S3 first: the user is saved with its key
    const isAvatarSaved = (await avatarUpload.value?.save()) ?? true

    if (!isAvatarSaved) return

    const { data } =
      isEdit.value && props.userId
        ? await rest.patch<{ data: User }>(
            restUrls.USER(props.userId),
            getBody(),
          )
        : await rest.post<{ data: User }>(restUrls.USERS, getBody())

    emit('saved', data)
  } catch (error) {
    processingError(error, { showToast: true })
  } finally {
    stopLoading()
  }
}

// Runs only when the form rules pass
const submit = handleSubmit(save)

onMounted(() => {
  if (isEdit.value) loadUser()
})
</script>

<!-- No buttons inside: the page puts them in its header and links them
     with form="<id of this form>" (id comes as an attribute) -->
<template>
  <form
    data-name="user-form"
    :data-component-name="COMPONENT_NAME"
    class="flex max-w-lg flex-col gap-4"
    novalidate
    @submit.prevent="submit"
  >
    <div v-if="status">
      <p class="mb-2 text-[15px] leading-5 font-semibold text-foreground">
        {{ t('users.form.status') }}
      </p>
      <UserStatusBadge :status="status" />
    </div>

    <AppTextArea
      v-if="isBlocked"
      v-model="form.blockReason"
      data-name="user-block-reason"
      name="blockReason"
      :label="t('users.block.reason')"
      :rules="[ruleRequired, ruleMaxLength(BLOCK_REASON_MAX_LENGTH)]"
    />

    <AppImageUpload
      ref="avatarUpload"
      v-model="form.avatarKey"
      data-name="user-avatar"
      name="avatar"
      :folder="uploadFolders.USER_AVATARS"
      :upload-mode="uploadModes.MANUAL"
      :url="avatarUrl"
      :original-url="avatarOriginalUrl"
      :label="t('users.form.avatar')"
    />

    <AppInput
      v-model="form.name"
      data-name="user-name"
      name="name"
      autocomplete="name"
      :label="t('users.form.name')"
      :rules="[ruleRequired, ruleMinLength(NAME_MIN_LENGTH)]"
    />

    <AppInput
      v-model="form.email"
      data-name="user-email"
      type="email"
      name="email"
      autocomplete="email"
      :label="t('users.form.email')"
      :rules="[ruleRequired, ruleEmail]"
    />

    <div>
      <AppInput
        v-model="form.password"
        data-name="user-password"
        type="password"
        name="password"
        autocomplete="new-password"
        :label="t('users.form.password')"
        :rules="passwordRules"
      />
      <p v-if="isEdit" class="mt-1.5 text-sm text-muted">
        {{ t('users.form.passwordHint') }}
      </p>
    </div>
  </form>
</template>
