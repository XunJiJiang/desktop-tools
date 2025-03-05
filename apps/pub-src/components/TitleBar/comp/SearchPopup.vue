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
import i18n from '@apps/i18n'

const { baseValue = '' } = defineProps<{
  baseValue: string
}>()

type CommandItem = {
  mark: string
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
const items = computed<CommandItem[]>(() => {
  const _items = [...itemsFromBackend.value, ...itemsFromFrontend.value]
  if (_items.length === 0) {
    return [
      {
        mark: '',
        command: '',
        comment: i18n.global.t('title.search.items.no-matching-results'),
        type: 'info',
        data: null,
        noLineBreak: true
      }
    ]
  }
  return _items
})
let unListener: () => void
let timeout: number | null = null
onMounted(() => {
  // 监听从后端加载的items
  // 目前不建议用
  unListener = ipc.on('search:updateItems', (_, { items }) => {
    itemsFromBackend.value = items.map((item) => {
      return {
        ...item,
        mark: '',
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

const value = ref(baseValue ?? '')
const selectedItemIndex = ref(0)

const updateSelectedIndex = debounce((v: string) => {
  const item = items.value[0]
  if (
    item.command.startsWith(v) ||
    (
      item.mark +
      item.command.slice(item.mark.length !== 0 ? item.mark.length + 1 : 0)
    ).startsWith(v)
  ) {
    selectedItemIndex.value = 0
  } else {
    selectedItemIndex.value = -1
  }
}, 50)

watch(value, (v) => {
  itemsFromBackend.value = []
  updateSelectedIndex(v ?? '')
})

const commandForm = useTemplateRef<HTMLFormElement>('command-form-ref')
const commandSubmit = (e: Event) => {
  e.preventDefault()
  if (!commandForm.value) return
  const item = items.value[selectedItemIndex.value] ?? {
    command: value.value,
    comment: '',
    type: 'run',
    data: null,
    noLineBreak: true
  }
  choose(item)
}

const runCommand = (command: string) => {
  ipc.send('command:parseAndRun', command)
  commandForm.value?.reset()
  value.value = ''
  emit('submit', command, null)
  emit('close')
}

const commandChange = debounce(async () => {
  // 请求后端解析命令
  const command = value.value
  const res = await ipc.invoke('command:fuzzyParse', command ?? '')
  console.log(res)
  itemsFromFrontend.value = res.reduce<CommandItem[]>(
    (pre, [mark, comments]) => {
      for (const comment of comments) {
        pre.push({
          mark,
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

const inputMousedown = (e: KeyboardEvent) => {
  if (!e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
    if (e.key === 'Escape') {
      e.preventDefault()
      emit('close')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (selectedItemIndex.value === -1) {
        selectedItemIndex.value = 1
      }
      if (selectedItemIndex.value > 0) {
        selectedItemIndex.value--
      } else {
        selectedItemIndex.value = items.value.length - 1
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (selectedItemIndex.value === -1) {
        selectedItemIndex.value = items.value.length - 1
      }
      if (selectedItemIndex.value < items.value.length - 1) {
        selectedItemIndex.value++
      } else {
        selectedItemIndex.value = 0
      }
    }
  }
}

const commandInputRef = useTemplateRef<HTMLInputElement>('command-input-ref')

const choose = (item: CommandItem) => {
  switch (item.type) {
    case 'run':
      nextTick(() => {
        runCommand(item.command)
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
            @keydown="inputMousedown"
          />
        </form>
      </div>
    </header>
    <div class="search-popup" v-if="items.length > 0">
      <ul>
        <li
          v-for="(item, i) in items"
          :class="{
            'no-line-break': item.noLineBreak,
            focused: selectedItemIndex === i
          }"
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

    &.focused {
      background-color: var(--search-popup-focus, $search-popup-focus);
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
