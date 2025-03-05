<script lang="ts">
type CommentType = import('@/types/command.d.ts').Comment
</script>

<script lang="ts" setup>
import ipc from '@apps/utils/ipc'
import {
  computed,
  nextTick,
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
  noLineBreak: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
} & CommentType

const emit = defineEmits<{
  submit: [command: string | null, data: CommandItem['data'] | null]
  close: []
}>()

const itemsFromFrontend = ref<CommandItem[]>([])
const itemsFromBackend = ref<CommandItem[]>([])
const items = computed(() => {
  return [...itemsFromBackend.value, ...itemsFromFrontend.value]
})
let unListener: () => void
let timeout: number | null = null
onMounted(() => {
  // 监听从后端加载的items
  unListener = ipc.on('search:updateItems', (_, { items }) => {
    itemsFromBackend.value = items.map((item) => {
      return {
        ...item,
        noLineBreak: true
      }
    })
  })
  timeout = setTimeout(() => {
    nextTick(() => {
      commandChange()
    })
  }, 50)
})
onUnmounted(() => {
  unListener?.()
  if (timeout) {
    clearTimeout(timeout)
  }
})

const commandForm = useTemplateRef<HTMLFormElement>('command-form-ref')
const commandSubmit = (e: Event) => {
  e.preventDefault()
  if (!commandForm.value) return
  const command = new FormData(commandForm.value).get('command') as string
  ipc.send('command:parseAndRun', command ?? '')
  commandForm.value?.reset()
  value.value = ''
  emit('submit', command, null)
  emit('close')
}

const commandChange = debounce(async () => {
  // 请求后端解析命令
  const command = value.value
  const res = await ipc.invoke('command:fuzzyParse', command ?? '')
  itemsFromFrontend.value = res.reduce<CommandItem[]>(
    (pre, [mark, comments]) => {
      for (const comment of comments) {
        pre.push({
          command: comment.command,
          comment: comment.comment,
          type: comment.type,
          data: null,
          noLineBreak: mark === comment.command
        })
      }

      return pre
    },
    []
  )
}, 300)

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
  switch (item.type) {
    case 'run':
      value.value = item.command
      nextTick(() => {
        commandSubmit(new Event('submit'))
      })
      break
    case 'fill':
      value.value = item.command
      commandChange()
      commandInputRef.value?.focus()
      break
    case 'info':
      commandInputRef.value?.focus()
      break
    default:
      break
  }
}

const value = ref(baseValue ?? '')
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
          :class="{ 'no-line-break': item.noLineBreak }"
          v-tooltip="[item.comment, 'bottom']"
          :key="item.command"
          @click="choose(item)"
        >
          <div class="item-comment">{{ item.comment }}</div>
          <div v-if="item.type !== 'info'" class="item-command">
            {{ item.command }}
          </div>
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
    padding: 5px 0;
    font-size: 13px;
    line-height: 16px;
    cursor: pointer;

    &:hover {
      background-color: var(--base-popup-hover-bg, $base-popup-hover-bg);
    }

    &.no-line-break {
      display: flex;
    }

    & .item-comment,
    & .item-command {
      margin-left: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    & .item-comment {
      color: var(--base-font-1, $base-font-1);
    }

    & .item-command {
      color: var(--base-font-2, $base-font-2);
    }
  }
}
</style>
