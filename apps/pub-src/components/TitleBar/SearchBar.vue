<script lang="ts">
import { on } from '@apps/utils/ipc'
</script>

<script lang="ts" setup>
import {
  computed,
  createVNode,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import IconFont from '@comp/IconFont/IconFont.vue'
import { useCssVar } from '@apps/store/modules/useCssVar'
import { createBasePopup } from '@comp/popup/BasePopup'
import { useWindowEvent } from '@apps/hooks/useWindowEvent'
import SearchPopup from './comp/SearchPopup.vue'

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
const searchBarRef = useTemplateRef<HTMLDivElement>('search-bar-ref')

const cssVar = useCssVar()

const color = computed(() => {
  return isFocused ? cssVar.vars['base-font-1'] : cssVar.vars['base-font-2']
})

let control: ReturnType<typeof createBasePopup> | null = null
const closePopup = () => {
  if (control) {
    control.hide()
    control = null
  }
}
const x = ref(0)
const y = ref(0)
const width = ref(0)
// const height = ref(400)

const createSearchPopup = (value = '') => {
  if (control) return
  control = createBasePopup(
    createVNode(SearchPopup, {
      key: 'search-popup',
      baseValue: value,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSubmit: (command: string | null, info: any) => {
        closePopup()
      }
    }),
    {
      x,
      y,
      width
    }
  )
  control.show()
}

let unListener: () => void
onMounted(() => {
  // 由后端启动 items
  unListener = on('search:load', (_, { value }) => {
    updatePosition()
    createSearchPopup(value)
  })
})
onUnmounted(() => {
  unListener?.()
})

watch(
  () => isFocused,
  (v) => {
    if (!v) closePopup()
  }
)

useWindowEvent('mousedown', (e) => {
  if (
    control &&
    !control?.ref?.contains(e.target as Node) &&
    !searchBarRef.value?.contains(e.target as Node)
  )
    closePopup()
})

const updatePosition = () => {
  if (!searchBarRef.value) return
  x.value = searchBarRef.value.offsetLeft - 5
  y.value = searchBarRef.value.offsetTop
  width.value = searchBarRef.value.offsetWidth + 10
}

useWindowEvent('resize', () => {
  updatePosition()
})

const showPopup = () => {
  updatePosition()
  createSearchPopup()
}
</script>

<template>
  <div
    ref="search-bar-ref"
    @click="showPopup"
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
