<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLoader } from '@/use/useLoader'

const COMPONENT_NAME = 'TheLoader'

defineOptions({ name: COMPONENT_NAME })

// Clicks are blocked at once; the spinner waits so fast requests don't flash
const SPINNER_DELAY_MS = 200

const { t } = useI18n()
const { isLoading } = useLoader()

const isSpinnerVisible = ref(false)

let spinnerTimer: ReturnType<typeof setTimeout> | undefined
// The app root goes inert while loading, which drops focus: put it back after
let focusedBeforeLoading: HTMLElement | null = null

watch(isLoading, (value) => {
  clearTimeout(spinnerTimer)

  if (value) {
    focusedBeforeLoading =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    spinnerTimer = setTimeout(() => {
      isSpinnerVisible.value = true
    }, SPINNER_DELAY_MS)
    return
  }

  isSpinnerVisible.value = false
  focusedBeforeLoading?.focus()
  focusedBeforeLoading = null
})
</script>

<template>
  <div
    v-if="isLoading"
    :data-component-name="COMPONENT_NAME"
    class="fixed inset-0 z-100"
  >
    <Transition
      enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
      enter-from-class="opacity-0"
    >
      <!-- Light dimming, no blur: the content stays readable -->
      <div
        v-if="isSpinnerVisible"
        class="flex size-full items-center justify-center bg-background/15"
      >
        <span
          class="relative block size-10 animate-spin rounded-full bg-conic from-transparent from-10% to-primary mask-[radial-gradient(farthest-side,transparent_calc(100%-4px),#000_calc(100%-3px))] after:absolute after:top-0 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary"
          aria-hidden="true"
        />
      </div>
    </Transition>
  </div>

  <p role="status" class="sr-only">
    {{ isSpinnerVisible ? t('common.loading') : '' }}
  </p>
</template>
