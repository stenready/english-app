<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
  useId,
  useTemplateRef,
  watch,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { rest } from '@/api'
import AppButton from '@/components/app/AppButton.vue'
import AppModal from '@/components/app/AppModal.vue'
import AppFieldLabel from '@/components/app/forms/AppFieldLabel.vue'
import AppValidationContainer from '@/components/app/forms/AppValidationContainer.vue'
import IconImage from '@/components/svg/IconImage.vue'
import {
  BYTES_IN_MEGABYTE,
  IMAGE_UPLOAD_MAX_SIZE,
  IMAGE_UPLOAD_TYPES,
} from '@/constants/imageUpload'
import restUrls from '@/constants/restUrls'
import type { UploadFolder } from '@/constants/uploadFolders'
import uploadModes, { type UploadMode } from '@/constants/uploadModes'
import { processingError } from '@/helpers/apiErrors'
import {
  formatFileTypes,
  hasRequiredRule,
  ruleFileMaxSize,
  ruleFileType,
} from '@/helpers/validationRules'
import type { UploadedFile } from '@/types/upload'
import type { ValidationRule } from '@/types/validation'

const COMPONENT_NAME = 'AppImageUpload'

defineOptions({ name: COMPONENT_NAME })

// Multipart field names expected by POST /uploads/images
const FILE_FIELD = 'file'
const FOLDER_FIELD = 'folder'

const props = withDefaults(
  defineProps<{
    // Unique on the page: data-name for tests and devtools. Not the form field name
    dataName: string
    // Where the server stores the file; only folders it allows (constants/uploadFolders)
    folder: UploadFolder
    // instant: upload on select; manual: only when save() is called
    uploadMode?: UploadMode
    label?: string
    name?: string
    // Extra rules for the chosen file (e.g. ruleRequired); type and size are always checked
    rules?: ValidationRule<File | null>[]
    // Link to the image of the current key (e.g. user.avatarUrl): shown in edit forms
    url?: string | null
    // Full-size copy of the current key (e.g. user.avatarOriginalUrl): the preview modal
    originalUrl?: string | null
    types?: string[]
    // Bytes
    maxSize?: number
  }>(),
  {
    uploadMode: uploadModes.INSTANT,
    label: undefined,
    name: undefined,
    rules: () => [],
    url: null,
    originalUrl: null,
    types: () => IMAGE_UPLOAD_TYPES,
    maxSize: IMAGE_UPLOAD_MAX_SIZE,
  },
)

// Key of the uploaded file (e.g. user/avatars/<uuid>.webp); null: no image.
// The form saves it with the entity
const model = defineModel<string | null>({ default: null })

const { t } = useI18n()
const inputId = useId()
const hintId = useId()
const input = useTemplateRef<HTMLInputElement>('input')

// The chosen file: validated here, then uploaded right away
const file = ref<File | null>(null)
// Manual mode: the chosen file waiting for save()
const pendingFile = ref<File | null>(null)
// A local link to the chosen file: shown while uploading and after, without a reload
const previewUrl = ref<string>()
// Link from the server for the current key
const uploadedUrl = ref<string | null>(props.url)
const uploadedOriginalUrl = ref<string | null>(props.originalUrl)
const isUploading = ref(false)
// Instant mode: save() waits for it, so the form doesn't send the old key
let instantUpload: Promise<boolean> = Promise.resolve(true)
const isPreviewOpen = ref(false)
// dragenter/dragleave also fire on child elements: count them, not a boolean
const dragDepth = ref(0)

// Edit forms load the entity after mount: the url comes later
watch(
  () => props.url,
  (value) => {
    uploadedUrl.value = value
  },
)

watch(
  () => props.originalUrl,
  (value) => {
    uploadedOriginalUrl.value = value
  },
)

const allRules = computed<ValidationRule<File | null>[]>(() => {
  return [
    ...props.rules,
    ruleFileType(props.types),
    ruleFileMaxSize(props.maxSize),
  ]
})

const isRequired = computed<boolean>(() => {
  return hasRequiredRule(props.rules)
})

const isDragging = computed<boolean>(() => {
  return dragDepth.value > 0
})

const shownImage = computed<string | null>(() => {
  if (previewUrl.value) return previewUrl.value

  return model.value ? uploadedUrl.value : null
})

// The modal shows the full-size copy: the thumbnail is too small to view
const previewImage = computed<string | null>(() => {
  if (previewUrl.value) return previewUrl.value

  return model.value ? (uploadedOriginalUrl.value ?? uploadedUrl.value) : null
})

const hint = computed<string>(() => {
  return t('imageUpload.hint', {
    types: formatFileTypes(props.types),
    size: props.maxSize / BYTES_IN_MEGABYTE,
  })
})

// Each object URL keeps the file in memory until revoked
const setPreview = (value: File | null): void => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)

  previewUrl.value = value ? URL.createObjectURL(value) : undefined
}

onBeforeUnmount(() => {
  setPreview(null)
})

// Same checks as ruleFileType / ruleFileMaxSize: their message is shown by the container
const isAcceptable = (value: File): boolean => {
  return props.types.includes(value.type) && value.size <= props.maxSize
}

const upload = async (value: File): Promise<boolean> => {
  const body = new FormData()

  body.append(FOLDER_FIELD, props.folder)
  body.append(FILE_FIELD, value)

  isUploading.value = true

  try {
    const { data } = await rest.post<{ data: UploadedFile }>(
      restUrls.UPLOAD_IMAGES,
      body,
    )

    model.value = data.key
    uploadedUrl.value = data.url
    uploadedOriginalUrl.value = data.originalUrl
    pendingFile.value = null

    return true
  } catch (error) {
    // Back to the previous image: the key didn't change
    processingError(error, { showToast: true })
    setPreview(null)
    file.value = null
    pendingFile.value = null

    return false
  } finally {
    isUploading.value = false
  }
}

const selectFile = (value: File | undefined): void => {
  if (!value || isUploading.value) return

  file.value = value

  if (!isAcceptable(value)) return

  setPreview(value)

  if (props.uploadMode === uploadModes.INSTANT) {
    instantUpload = upload(value)

    return
  }

  pendingFile.value = value
}

// For the form before sending: true when model holds the right key.
// false: upload failed, the error is shown under the field
const save = async (): Promise<boolean> => {
  if (pendingFile.value) return upload(pendingFile.value)

  return isUploading.value ? instantUpload : true
}

defineExpose({ save })

const onInputChange = (): void => {
  selectFile(input.value?.files?.[0])

  // The same file chosen again must fire change again
  if (input.value) input.value.value = ''
}

const onDragEnter = (): void => {
  dragDepth.value++
}

const onDragLeave = (): void => {
  dragDepth.value = Math.max(0, dragDepth.value - 1)
}

const onDrop = (event: DragEvent): void => {
  dragDepth.value = 0
  selectFile(event.dataTransfer?.files[0])
}

// Only clears the key: the server deletes the old file when the form is saved
const remove = (): void => {
  model.value = null
  file.value = null
  pendingFile.value = null
  setPreview(null)
}
</script>

<template>
  <AppValidationContainer
    v-slot="{ invalid, errorId, onBlur }"
    :name="props.name"
    :rules="allRules"
    :label="props.label"
    :value="file"
  >
    <div :data-component-name="COMPONENT_NAME" :data-name="props.dataName">
      <AppFieldLabel
        v-if="props.label"
        :for="inputId"
        :is-required="isRequired"
      >
        {{ props.label }}
      </AppFieldLabel>

      <!-- The whole zone opens the file picker; the input itself is visually hidden -->
      <label
        :for="inputId"
        class="flex cursor-pointer items-center gap-5 rounded-xl border-2 border-dashed p-4 transition-colors focus-within:ring-3"
        :aria-busy="isUploading"
        :class="[
          isDragging
            ? 'border-primary bg-primary/5'
            : invalid
              ? 'border-danger/60 hover:border-danger'
              : 'border-border hover:border-primary/60 hover:bg-surface',
          invalid
            ? 'focus-within:ring-danger/20'
            : 'focus-within:ring-primary/20',
          { 'pointer-events-none': isUploading },
        ]"
        @dragenter.prevent="onDragEnter"
        @dragover.prevent
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
      >
        <input
          :id="inputId"
          ref="input"
          type="file"
          class="sr-only"
          :name="props.name"
          :accept="props.types.join(',')"
          :aria-label="props.label"
          :disabled="isUploading"
          :aria-invalid="invalid || undefined"
          :aria-required="isRequired || undefined"
          :aria-describedby="[hintId, errorId].filter(Boolean).join(' ')"
          @change="onInputChange"
          @blur="onBlur"
        />

        <!-- A button inside the <label>: its click opens the preview, not the file picker -->
        <button
          v-if="shownImage"
          type="button"
          class="group/preview relative size-24 shrink-0 cursor-zoom-in overflow-hidden rounded-2xl ring-1 ring-border outline-none focus-visible:ring-3 focus-visible:ring-primary/40"
          :aria-label="t('imageUpload.preview')"
          @click="isPreviewOpen = true"
        >
          <img
            :src="shownImage"
            alt=""
            class="size-full object-cover transition-transform duration-200 group-hover/preview:scale-105"
          />
          <span
            v-if="isUploading"
            class="absolute inset-0 flex items-center justify-center bg-background/60"
          >
            <span
              class="size-6 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
              aria-hidden="true"
            />
            <span class="sr-only">{{ t('imageUpload.uploading') }}</span>
          </span>
        </button>
        <span
          v-else
          class="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-surface text-muted ring-1 ring-border"
        >
          <IconImage class="size-8" />
        </span>

        <span class="flex min-w-0 flex-col gap-1">
          <span class="text-sm text-foreground">
            <template v-if="isDragging">{{
              t('imageUpload.dropActive')
            }}</template>
            <template v-else>
              {{ t('imageUpload.dropHere') }}
              <span
                class="font-semibold text-primary underline-offset-2 hover:underline"
              >
                {{ t('imageUpload.choose') }}
              </span>
            </template>
          </span>
          <span :id="hintId" class="text-xs text-muted">{{ hint }}</span>
          <span v-if="file" class="truncate text-xs text-muted">{{
            file.name
          }}</span>

          <AppButton
            v-if="(shownImage || file) && !isUploading"
            :data-name="`${props.dataName}-remove`"
            variant="outline"
            size="sm"
            class="mt-2 w-fit"
            @click.prevent="remove"
          >
            {{ t('imageUpload.remove') }}
          </AppButton>
        </span>
      </label>

      <!-- Outside the <label>: clicks inside the modal must not open the file picker -->
      <AppModal
        v-model="isPreviewOpen"
        name="image-preview"
        :title="t('imageUpload.preview')"
        :description="file?.name"
        size="xl"
      >
        <img
          v-if="previewImage"
          :src="previewImage"
          :alt="file?.name ?? props.label ?? ''"
          class="mx-auto max-h-[70dvh] w-auto max-w-full rounded-lg object-contain"
        />
      </AppModal>
    </div>
  </AppValidationContainer>
</template>
