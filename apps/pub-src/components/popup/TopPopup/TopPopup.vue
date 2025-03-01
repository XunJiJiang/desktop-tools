<script lang="ts"></script>

<script lang="ts" setup>
const { message, type = 'info' } = defineProps<{
  message: string
  type?: 'info' | 'success' | 'warning' | 'danger'
}>()
</script>

<template>
  <div
    :class="{
      alert: true,
      'alert-info': type === 'info',
      'alert-success': type === 'success',
      'alert-warning': type === 'warning',
      'alert-danger': type === 'danger'
    }"
  >
    {{ message }}
  </div>
</template>

<style scoped lang="scss">
.alert {
  padding: 0px 6px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 14px;
}
.alert-info {
  color: #31708f;
  background-color: #d9edf7;
  border-color: #bce8f1;
}
.alert-success {
  color: #3c763d;
  background-color: #dff0d8;
  border-color: #d6e9c6;
}
.alert-warning {
  color: #8a6d3b;
  background-color: #fcf8e3;
  border-color: #faebcc;
}
.alert-danger {
  color: #a94442;
  background-color: #f2dede;
  border-color: #ebccd1;
}
</style>
