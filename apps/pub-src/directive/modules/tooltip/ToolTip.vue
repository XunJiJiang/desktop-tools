<script lang="ts">
export type TooltipProps = {
  message: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  target: {
    x: number
    y: number
    width: number
    height: number
  }
}
/** 箭头尺寸(对角) */
const ARROW_SIZE = 5.65685425
</script>

<script lang="ts" setup>
import { computed } from 'vue'
import { getStringWidth } from '@apps/utils/getStringWidth'
import { useStyle } from '@apps/style'
const style = useStyle()

const { message, position = 'top', target } = defineProps<TooltipProps>()
const contentWidth = computed(
  () =>
    getStringWidth(message, {
      fontSize: 12,
      fontFamily: style.get('font-family')
    }) +
    ARROW_SIZE * 2 +
    2 /* border */ +
    2
)
const contentWidthPx = computed(() => contentWidth.value + 'px')
/** content 在 x 轴方向的偏移值, 防止超出左右窗口边界 */
const contentOffsetPx = computed(() => {
  if (position === 'left' || position === 'right') {
    return '0px'
  }
  const MARGIN = 3
  const offset = target.x + target.width / 2 - contentWidth.value / 2
  if (offset < 0) {
    return -offset + MARGIN + 'px'
  } else if (offset + contentWidth.value > window.innerWidth) {
    return window.innerWidth - offset - contentWidth.value - MARGIN + 'px'
  } else {
    return '0px'
  }
})
const arrowPosition = computed(() => {
  switch (position) {
    case 'top':
      return 'arrow-bottom'
    case 'bottom':
      return 'arrow-top'
    case 'left':
      return 'arrow-right'
    case 'right':
      return 'arrow-left'
    default:
      return 'arrow-bottom'
  }
})
/** 容器位置为文本内容中心 */
const containerPosition = computed(() => {
  switch (position) {
    case 'top':
      return [
        target.x + target.width / 2,
        target.y - ARROW_SIZE / 2 - 1 /* border */ - 10 /* line-height */
      ]
    case 'bottom':
      return [
        target.x + target.width / 2,
        target.y +
          target.height +
          ARROW_SIZE / 2 +
          1 /* border */ +
          10 /* line-height */
      ]
    case 'left':
      return [
        target.x - ARROW_SIZE / 2 - 1 /* border */ - contentWidth.value / 2,
        target.y + target.height / 2
      ]
    case 'right':
      return [
        target.x +
          target.width +
          ARROW_SIZE / 2 +
          1 /* border */ +
          contentWidth.value / 2,
        target.y + target.height / 2
      ]
    default:
      return [
        target.x + target.width / 2,
        target.y - ARROW_SIZE / 2 - 1 /* border */ - 10 /* line-height */
      ]
  }
})
const containerTop = computed(() => containerPosition.value[1] + 'px')
const containerLeft = computed(() => containerPosition.value[0] + 'px')
</script>

<template>
  <div class="tooltip-container">
    <div class="tooltip-content">
      <span>{{ message }}</span>
    </div>
    <div
      :class="{
        arrow: true,
        [arrowPosition]: true
      }"
    ></div>
  </div>
</template>

<style scoped lang="scss">
@use '@apps/theme/base/var.scss' as *;

.tooltip-container {
  position: absolute;
  background: transparent;
  margin: 0;
  padding: 0;
  width: 0;
  height: 0;
  left: v-bind(containerLeft);
  top: v-bind(containerTop);
  overflow: visible;

  .tooltip-content {
    height: 20px;
    position: absolute;
    top: 0;
    left: 0;
    transform: translate(calc(-50% + v-bind(contentOffsetPx)), -50%);
    background: var(--tooltip-bg, $tooltip-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--tooltip-border, $tooltip-border);
    border-radius: 4px;

    font-size: 12px;
    line-height: 20px;
    width: v-bind(contentWidthPx);
    color: var(--tooltip-font, $tooltip-font);
    white-space: nowrap;

    text-align: center;

    z-index: -1;
  }

  .arrow {
    position: absolute;
    width: 4px;
    height: 4px;
    border: 1px solid;

    transform-origin: center;
  }

  .arrow-top {
    top: calc(50% - 2.82842712px - 10px);
    left: 50%;
    transform: translate(-50%) rotate(45deg);
    border-top-color: var(--tooltip-border, $tooltip-border);
    border-left-color: var(--tooltip-border, $tooltip-border);
    border-right-color: transparent;
    border-bottom-color: transparent;

    background: linear-gradient(
      135deg,
      var(--tooltip-arrow-bg, $tooltip-arrow-bg) 65%,
      transparent 35%
    );
  }

  .arrow-bottom {
    top: calc(50% - 2.82842712px + 10px);
    left: 50%;
    transform: translate(-50%) rotate(45deg);
    border-top-color: transparent;
    border-left-color: transparent;
    border-right-color: var(--tooltip-border, $tooltip-border);
    border-bottom-color: var(--tooltip-border, $tooltip-border);

    background: linear-gradient(
      315deg,
      var(--tooltip-arrow-bg, $tooltip-arrow-bg) 65%,
      transparent 35%
    );
  }

  .arrow-left {
    top: 50%;
    left: calc(50% - 2.82842712px - v-bind(contentWidthPx) / 2);
    transform: translateY(-50%) rotate(45deg);
    border-top-color: transparent;
    border-left-color: var(--tooltip-border, $tooltip-border);
    border-right-color: transparent;
    border-bottom-color: var(--tooltip-border, $tooltip-border);

    background: linear-gradient(
      225deg,
      var(--tooltip-arrow-bg, $tooltip-arrow-bg) 65%,
      transparent 35%
    );
  }

  .arrow-right {
    top: 50%;
    left: calc(50% - 2.82842712px + v-bind(contentWidthPx) / 2);
    transform: translateY(-50%) rotate(45deg);
    border-top-color: var(--tooltip-border, $tooltip-border);
    border-left-color: transparent;
    border-right-color: var(--tooltip-border, $tooltip-border);
    border-bottom-color: transparent;

    background: linear-gradient(
      45deg,
      var(--tooltip-arrow-bg, $tooltip-arrow-bg) 65%,
      transparent 35%
    );
  }
}
</style>
