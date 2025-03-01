<script lang="ts"></script>

<script lang="ts" setup>
import ipc from '@apps/utils/ipc'
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import BaseInput from '@comp/input/BaseInput.vue'
import { debounce } from '@apps/utils/debounceThrottling'
import vFocus from '@apps/directive/modules/focus.ts'
import vTooltip from '@apps/directive/modules/tooltip'

const { baseValue = '' } = defineProps<{
  baseValue: string
}>()

type CommandItem = {
  value: string
  command: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: any
}

const emit = defineEmits<{
  submit: [command: string | null, info: CommandItem['info'] | null]
  close: []
}>()

const itemsFromFrontend = ref<CommandItem[]>([])
const itemsFromBackend = ref<CommandItem[]>([])
const items = computed(() => {
  return [...itemsFromBackend.value, ...itemsFromFrontend.value]
})
let unListener: () => void
onMounted(() => {
  // 从后端加载的items
  // TODO: 还有一部分是从前端加载, 暂时不写
  unListener = ipc.on('search:updateItems', (_, { items }) => {
    itemsFromBackend.value = items
  })
})
onUnmounted(() => {
  unListener?.()
})

const commandForm = useTemplateRef<HTMLFormElement>('command-form-ref')
const commandSubmit = (e: Event) => {
  e.preventDefault()
  if (!commandForm.value) return
  const command = new FormData(commandForm.value).get('command') as string
  ipc.send('command:parseAndRun', command)
  commandForm.value?.reset()
  value.value = ''
  emit('submit', command, null)
  emit('close')
}

const commandChange = debounce(async (e: Event) => {
  const command = (e.target as HTMLInputElement).value
  const res = await ipc.invoke('command:fuzzyParse', command)
  itemsFromFrontend.value = res[1].map(({ command, comment }) => {
    return {
      value: comment,
      command,
      info: comment
    }
  })
}, 500)

const inputESC = (e: KeyboardEvent) => {
  if (
    e.key === 'Escape' &&
    !e.ctrlKey &&
    !e.shiftKey &&
    !e.altKey &&
    !e.metaKey
  ) {
    emit('close')
  }
}

const commandInputRef = useTemplateRef<HTMLInputElement>('command-input-ref')

const choose = (item: CommandItem) => {
  value.value = item.command ?? ''
  commandInputRef.value?.focus()
}

const value = ref(baseValue)
watch(value, () => {
  itemsFromBackend.value = []
})
</script>

<template>
  <div>
    <header class="search-container" ref="container">
      <div>
        <form
          id="command-form"
          class="command-form"
          @submit="commandSubmit"
          ref="command-form-ref"
        >
          <BaseInput
            v-focus
            ref="command-input-ref"
            name="command"
            type="text"
            v-model="value"
            @input="commandChange"
            @keydown="inputESC"
          />
        </form>
      </div>
    </header>
    <div class="search-popup" v-if="items.length > 0">
      <ul>
        <li
          v-for="item in items"
          v-tooltip="[item.value, 'bottom']"
          :key="item.value"
          @click="choose(item)"
        >
          {{ item.value }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@apps/theme/base/var.scss' as *;
.search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 34px;
  background-color: var(--base-bg, $base-bg);

  & div {
    width: 100%;
  }

  & form {
    width: 100%;
    display: flex;
    justify-content: center;
  }
}

.search-popup {
  width: 100%;
  background-color: transparent;

  & ul {
    list-style: none;
    padding: 0 5px;
    margin: 0 0 5px 0;
  }

  & li {
    height: 13px;
    padding: 5px 10px;
    font-size: 13px;
    line-height: 13px;
    cursor: pointer;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      background-color: var(--base-popup-hover-bg, $base-popup-hover-bg);
    }
  }
}
</style>
