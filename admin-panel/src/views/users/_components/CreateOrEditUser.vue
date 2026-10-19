<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { rest } from '@/api'
import AppButton from '@/components/app/AppButton.vue'
import AppImageUpload from '@/components/app/forms/AppImageUpload.vue'
import AppInput from '@/components/app/forms/AppInput.vue'
import formModes, { type FormMode } from '@/constants/formModes'
import restUrls from '@/constants/restUrls'
import uploadFolders from '@/constants/uploadFolders'
import uploadModes from '@/constants/uploadModes'
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

const COMPONENT_NAME = 'CreateOrEditUser'

defineOptions({ name: COMPONENT_NAME })

// Same limits as the backend userInputSchema
const NAME_MIN_LENGTH = 2
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128

interface UserForm {
  name: string
  email: string
  password: string
  avatarKey: string | null
}

const props = defineProps<{
  mode: FormMode
  // Required in edit mode: the user to load and save
  userId?: string
}>()

const emit = defineEmits<{
  saved: [user: User]
  cancel: []
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
})
// Link to the saved avatar: only for showing it, the server takes avatarKey
const avatarUrl = ref<string | null>(null)

const isEdit = computed<boolean>(() => {
  return props.mode === formModes.EDIT
})

// Edit: an empty password keeps the current one, so it is not required
const passwordRules = computed<ValidationRule[]>(() => {
  const lengthRules = [
    ruleMinLength(PASSWORD_MIN_LENGTH),
    ruleMaxLength(PASSWORD_MAX_LENGTH),
  ]

  return isEdit.value ? lengthRules : [ruleRequired, ...lengthRules]
})

const getBody = (): Partial<UserForm> => {
  const { name, email, password, avatarKey } = form.value

  return isEdit.value && !password
    ? { name, email, avatarKey }
    : { name, email, password, avatarKey }
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
    }
    avatarUrl.value = data.avatarUrl
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

<template>
  <form
    :data-component-name="COMPONENT_NAME"
    class="flex max-w-lg flex-col gap-4"
    novalidate
    @submit.prevent="submit"
  >
    <AppImageUpload
      ref="avatarUpload"
      v-model="form.avatarKey"
      name="avatar"
      :folder="uploadFolders.USER_AVATARS"
      :upload-mode="uploadModes.MANUAL"
      :url="avatarUrl"
      :label="t('users.form.avatar')"
    />

    <AppInput
      v-model="form.name"
      name="name"
      autocomplete="name"
      :label="t('users.form.name')"
      :rules="[ruleRequired, ruleMinLength(NAME_MIN_LENGTH)]"
    />

    <AppInput
      v-model="form.email"
      type="email"
      name="email"
      autocomplete="email"
      :label="t('users.form.email')"
      :rules="[ruleRequired, ruleEmail]"
    />

    <div>
      <AppInput
        v-model="form.password"
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

    <div class="flex gap-3">
      <AppButton type="submit">
        {{ isEdit ? t('users.form.save') : t('users.form.create') }}
      </AppButton>
      <AppButton variant="outline" @click="emit('cancel')">
        {{ t('users.form.cancel') }}
      </AppButton>
    </div>
  </form>
</template>
