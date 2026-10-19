<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/app/AppButton.vue'
import AppModal from '@/components/app/AppModal.vue'
import buttonVariants from '@/constants/buttonVariants'
import modalSizes from '@/constants/modalSizes'
import { useGlobalModalHost } from '@/use/useGlobalModal'

const COMPONENT_NAME = 'AppConfirmModal'

defineOptions({ name: COMPONENT_NAME })

const { t } = useI18n()
const { request, isOpen, settle, clear } = useGlobalModalHost()

const onModalUpdate = (value: boolean): void => {
  if (!value) settle(false)
}
</script>

<template>
  <AppModal
    v-if="request"
    :key="request.id"
    :model-value="isOpen"
    :name="request.settings.name"
    :title="request.settings.title"
    :description="request.settings.description"
    :size="request.settings.size ?? modalSizes.SM"
    :position="request.settings.position"
    @update:model-value="onModalUpdate"
    @closed="clear"
  >
    <template #footer>
      <AppButton :variant="buttonVariants.OUTLINE" @click="settle(false)">
        {{ request.settings.cancelText ?? t('common.cancel') }}
      </AppButton>
      <!-- autofocus: AppModal focuses it on open, Enter confirms -->
      <AppButton
        :variant="request.settings.confirmVariant ?? buttonVariants.PRIMARY"
        autofocus
        @click="settle(true)"
      >
        {{ request.settings.confirmText ?? t('common.confirm') }}
      </AppButton>
    </template>
  </AppModal>
</template>
