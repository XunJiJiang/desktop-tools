<script lang="ts">
export type BasePopupProps = {
  x: number
  y: number
  width: number | null
  height: number | null
  zIndex: number
  beyondViewport?: (data: { width: number; height: number }) => void
}
</script>

<script lang="ts" setup>
import { computed, useTemplateRef, onMounted } from 'vue'
const {
  x,
  y,
  width,
  height,
  zIndex,
  beyondViewport = () => {}
} = defineProps<BasePopupProps>()

const visible = defineModel<boolean>('visible', { required: true })
const basePopupRef = useTemplateRef<HTMLDivElement>('base-popup-ref')
const xPx = computed(() => `${x}px`)
const yPx = computed(() => `${y}px`)
const widthPx = computed(() => (width ? `${width}px` : 'auto'))
const heightPx = computed(() => (height ? `${height}px` : 'auto'))
defineExpose({
  ref: basePopupRef
})
onMounted(() => {
  if (!basePopupRef.value) return
  const winHeight = window.innerHeight
  const winWidth = window.innerWidth
  const rect = basePopupRef.value
  if (
    rect.offsetWidth + x > winWidth ||
    rect.offsetWidth < winWidth ||
    rect.offsetHeight + y > winHeight ||
    rect.offsetHeight < winHeight
  ) {
    beyondViewport({ width: rect.offsetWidth, height: rect.offsetHeight })
  }
})
</script>

<template>
  <div ref="base-popup-ref" v-if="visible" class="base-popup">
    <div class="base-popup__content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@apps/theme/base/var.scss' as *;

.base-popup {
  position: fixed;
  top: v-bind(yPx);
  left: v-bind(xPx);
  width: v-bind(widthPx);
  height: v-bind(heightPx);
  background-color: var(--base-popup-bg, $base-popup-bg);
  backdrop-filter: blur(30px);
  color: var(--base-popup-font, $base-popup-font);
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  border: 1px solid var(--base-popup-border, $base-popup-border);
  overflow: hidden;
  z-index: v-bind(zIndex);
  pointer-events: auto;

  &.base-popup__content {
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: transparent;
    border-radius: 4px;
    box-shadow: 0 0 10px var(--base-popup-box-shadow, $base-popup-box-shadow);
  }
}
</style>
