<script lang="ts" setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 16
  },
  color: {
    type: String,
    default: '#000'
  },
  style: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <span
    :class="{
      iconfont: true,
      [`icon-${name}`]: true
    }"
    :style="{ fontSize: size + 'px', color: color, ...style }"
  ></span>
</template>

<style scoped lang="scss">
@use '@apps/assets/icon/iconfont.css';
</style>
