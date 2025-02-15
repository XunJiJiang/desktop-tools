<script lang="ts"></script>

<script lang="ts" setup>
import { computed } from 'vue'
import IconFont from '@comp/IconFont/IconFont.vue'
import { useCssVar } from '@apps/store/modules/useCssVar'
const { isFocused } = defineProps({
  isFocused: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  titleBarStyle: {
    type: String,
    required: true
  }
})

const cssVar = useCssVar()

const color = computed(() => {
  return isFocused ? cssVar.vars['base-font-1'] : cssVar.vars['base-font-2']
})
const click = () => {
  console.log('click')
}
</script>

<template>
  <div
    @click="click"
    v-tooltip="[title, 'bottom']"
    :class="{
      'search-bar': true,
      focused: isFocused,
      macos: titleBarStyle === 'macos'
    }"
  >
    <IconFont name="search" :color :size="13" />
    &nbsp;
    {{ title }}
  </div>
</template>

<style scoped lang="scss">
$search-bar-max-width: 600px;

.search-bar.macos {
  flex: 0 0 max(min($search-bar-max-width, calc(100% - 10px)), 222px);
}

.search-bar {
  justify-content: center;
  margin: 5px;

  max-width: $search-bar-max-width;
  flex: 0 0 min($search-bar-max-width, calc(100% - 10px));

  font-size: 12px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;

  background-color: #cecece10;

  border-color: #8a8a8a5e;
  border-width: 1px;
  border-style: solid;
  border-radius: 8px;

  cursor: pointer;

  -webkit-app-region: no-drag;

  @media screen and (max-width: 520px) {
    flex: 0 0 calc(100% - 10px);
  }

  &:hover {
    background-color: #cecece1d;
  }

  &.focused:hover {
    border-color: #d3d3d34f;
  }
}
</style>
