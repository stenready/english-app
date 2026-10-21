<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { rest } from '@/api'
import AppButton from '@/components/app/AppButton.vue'
import AppModal from '@/components/app/AppModal.vue'
import AppTextArea from '@/components/app/forms/AppTextArea.vue'
import buttonVariants from '@/constants/buttonVariants'
import modalPositions from '@/constants/modalPositions'
import modalSizes from '@/constants/modalSizes'
import restUrls from '@/constants/restUrls'
import userStatuses, { type UserStatus } from '@/constants/userStatuses'
import { processingError } from '@/helpers/apiErrors'
import { ruleMaxLength, ruleRequired } from '@/helpers/validationRules'
import { useLoader } from '@/use/useLoader'
import { useToast } from '@/use/useToast'
import type { User } from '@/types/user'

const COMPONENT_NAME = 'ConfirmBlockOrUnblockModal'

defineOptions({ name: COMPONENT_NAME })

// Same limit as the backend userInputSchema
const REASON_MAX_LENGTH = 500

const props = defineProps<{
  user: User | null
}>()

const emit = defineEmits<{
  // The status is saved: e.g. reload the list
  success: []
}>()

const isOpen = defineModel<boolean>({ default: false })

const { t } = useI18n()
const { handleSubmit, resetForm } = useForm()
const { startLoading, stopLoading } = useLoader()
const { showSuccess } = useToast()
// The submit button sits in the modal footer, outside the <form>: form="…" links them
const formId = useId()

const reason = ref('')

// A blocked user can only be unblocked; anyone else can only be blocked
const isBlock = computed<boolean>(() => {
  return props.user?.status !== userStatuses.BLOCKED
})

const reset = (): void => {
  reason.value = ''
  resetForm()
}

const getChanges = (): { status: UserStatus; blockReason?: string } => {
  return isBlock.value
    ? { status: userStatuses.BLOCKED, blockReason: reason.value.trim() }
    : { status: userStatuses.ACTIVE }
}

// The modal stays open if the request fails: the typed reason isn't lost
const save = async (): Promise<void> => {
  if (!props.user) return

  startLoading()

  try {
    await rest.patch(restUrls.USER(props.user.id), getChanges())
    showSuccess(
      isBlock.value ? t('users.block.success') : t('users.unblock.success'),
    )
    isOpen.value = false
    emit('success')
  } catch (error) {
    processingError(error, { showToast: true })
  } finally {
    stopLoading()
  }
}

// Block: runs only when the reason passes the rules
const submit = handleSubmit(save)
</script>

<template>
  <AppModal
    v-model="isOpen"
    name="block-or-unblock-user"
    :title="isBlock ? t('users.block.title') : t('users.unblock.title')"
    :description="
      isBlock
        ? t('users.block.description', { name: props.user?.name })
        : t('users.unblock.description', { name: props.user?.name })
    "
    :size="modalSizes.SM"
    :position="modalPositions.TOP"
    @closed="reset"
  >
    <form
      :id="formId"
      data-name="block-form"
      novalidate
      @submit.prevent="submit"
    >
      <AppTextArea
        v-if="isBlock"
        v-model="reason"
        data-name="block-reason"
        name="reason"
        :label="t('users.block.reason')"
        :rules="[ruleRequired, ruleMaxLength(REASON_MAX_LENGTH)]"
        autofocus
      />
    </form>

    <template #footer>
      <AppButton
        data-name="block-modal-cancel"
        :variant="buttonVariants.OUTLINE"
        @click="isOpen = false"
      >
        {{ t('common.cancel') }}
      </AppButton>
      <AppButton
        data-name="block-modal-submit"
        type="submit"
        :form="formId"
        :variant="isBlock ? buttonVariants.DANGER : buttonVariants.PRIMARY"
        :autofocus="!isBlock"
      >
        {{
          isBlock ? t('users.list.actionBlock') : t('users.list.actionUnblock')
        }}
      </AppButton>
    </template>
  </AppModal>
</template>
