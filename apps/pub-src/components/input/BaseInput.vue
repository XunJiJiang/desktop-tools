<script lang="ts" setup>
import { computed, ref, useTemplateRef, watch } from 'vue'

const {
  id,
  type,
  required = false,
  value,
  placeholder = '',
  name = '',
  focusStyle = false,
  loading = false
} = defineProps<{
  id?: string
  type: string
  required?: boolean
  value?: string
  placeholder?: string
  name?: string
  focusStyle?: boolean
  loading?: boolean
}>()
type Emit = (e: Event) => boolean | void
const emit = defineEmits({
  change: (() => true) as Emit,
  input: (() => true) as Emit,
  blur: (() => true) as Emit,
  focus: (() => true) as Emit
})
const vModel = defineModel()
const loadingValue = computed(() => (loading ? value + '...' : value))

const _vModel = ref<unknown>('')
watch(
  [loadingValue, vModel],
  ([v, vm]) => {
    _vModel.value = vm && vm !== '' ? vm : v
  },
  {
    immediate: true
  }
)
watch(_vModel, (v) => {
  vModel.value = v
})

const inputRef = useTemplateRef<HTMLInputElement>('input-ref')

defineExpose({
  focus: () => {
    const input = inputRef.value
    if (input) {
      input.focus()
    }
  }
})
</script>

<template>
  <input
    :class="{
      focus: focusStyle,
      loading
    }"
    ref="input-ref"
    :id="id"
    :type="type"
    :value="vModel ? vModel : loadingValue"
    :placeholder="placeholder"
    :name="name"
    :required="required"
    @change="emit('change', $event)"
    @input="emit('input', $event)"
    @blur="emit('blur', $event)"
    @focus="emit('focus', $event)"
    v-model="_vModel"
  />
</template>

<style scoped lang="scss">
@use '@apps/theme/base/var.scss' as *;
input {
  width: calc(100% - 10px);
  height: 24px;
  background-color: transparent;
  color: #fff;
  font-size: 13px;
  border: 1px solid var(--base-input-border, $base-input-border);
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0 4px;

  transition:
    border 0.15s,
    box-shadow 0.15s;

  outline: none;

  &[type='submit'],
  &[type='button'] {
    height: 34px;
    background-color: var(--base-input-button-bg, $base-input-button-bg);
    color: var(--base-input-button-font, $base-input-button-font);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.15s;

    &:hover {
      background-color: var(
        --base-input-button-hover-bg,
        $base-input-button-hover-bg
      );
    }

    &:active {
      background-color: var(
        --base-input-button-active-bg,
        $base-input-button-active-bg
      );
    }

    &:focus {
      animation: focusAT 0.5s forwards 1;
    }
  }

  &[type='checkbox'] {
    width: 12px;
    height: 12px;
    margin: 0 4px;
    background-color: transparent;
    cursor: pointer;
  }

  &.focus {
    &:focus {
      animation: focusAT 0.5s forwards 1;
      animation-timing-function: cubic-bezier(0.25, 0, 0.25, 1);
      border: 2px solid var(--base-input-focus-border, $base-input-focus-border);
    }
  }
}

@keyframes focusAT {
  0% {
    box-shadow: 0 0 0 0px transparent;
  }
  10% {
    box-shadow: 0 0 0 3px
      var(--base-input-focus-shadow, $base-input-focus-shadow);
  }
  100% {
    box-shadow: 0 0 0 6px transparent;
  }
}
</style>
