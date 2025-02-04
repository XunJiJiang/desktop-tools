<script lang="ts"></script>

<script lang="ts" setup>
const { message, arrowPosition = 'top' } = defineProps<{
  message: string
  arrowPosition?: 'top' | 'bottom' | 'left' | 'right'
}>()

</script>

<template>
  <div class="tooltip-container">
    <div
      :class="{
        arrow: true,
        [arrowPosition]: true
      }"
    ></div>
    <div class="tooltip-content">
      <span>{{ message }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
