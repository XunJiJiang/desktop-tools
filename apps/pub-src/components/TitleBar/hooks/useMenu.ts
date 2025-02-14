import ipc from '@apps/utils/ipc'
import type {
  MenuItem,
  MountEvent
} from '@comp/button/menuButton/MenuButton.vue'
import {
  computed,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  type ComputedRef
} from 'vue'

export const useMenu = (maxWidth: ComputedRef<number>) => {
  const allMenu = ref<MenuItem[]>([])
  const remainingWidth = ref(0)
  const allRemainingWidth = ref(0)
  const showRemaining = ref(false)
  const showAllRemaining = ref(false)
  const remainingSubmenu = ref<MenuItem[]>([])
  const allRemainingSubmenu = ref<MenuItem[]>([])
  const buttonWidthMap = reactive(new Map<string, number>())
  const menu = computed(() => {
    showRemaining.value = false
    showAllRemaining.value = false
    if (maxWidth.value && buttonWidthMap.size !== allMenu.value.length) {
      if (remainingWidth.value === 0) {
        showRemaining.value = true
      }
      if (allRemainingWidth.value === 0) {
        showAllRemaining.value = true
      }
      return allMenu.value
    } else if (allMenu.value.length >= 3) {
      const _menu: MenuItem[] = []
      let _width = 0
      for (let i = 0; i < 3; ++i) {
        _width += buttonWidthMap.get(allMenu.value[i].label)!
        _menu.push(allMenu.value[i])
      }
      if (_width + remainingWidth.value + 5 < maxWidth.value) {
        for (let i = 3; i < allMenu.value.length; ++i) {
          const itemWidth = buttonWidthMap.get(allMenu.value[i].label)!
          if (_width + itemWidth + remainingWidth.value + 5 < maxWidth.value) {
            _width += itemWidth
            _menu.push(allMenu.value[i])
            continue
          } else {
            if (
              i === allMenu.value.length &&
              _width + itemWidth + 5 < maxWidth.value
            ) {
              _width += itemWidth
              _menu.push(allMenu.value[i])
              showAllRemaining.value = false
              showRemaining.value = false
            } else {
              showAllRemaining.value = false
              if (_menu.length < allMenu.value.length)
                showRemaining.value = true
              else showRemaining.value = false
              remainingSubmenu.value = allMenu.value.filter((_, j) => j >= i)
              break
            }
          }
        }
        return _menu
      } else {
        allRemainingSubmenu.value = allMenu.value
        showAllRemaining.value = true
        showRemaining.value = false
        return []
      }
    } else {
      if (remainingWidth.value === 0) {
        showRemaining.value = true
      }
      if (allRemainingWidth.value === 0) {
        showAllRemaining.value = true
      }
      return allMenu.value
    }
  })
  let unListerFn: Ipc.UnListen = () => {}
  onMounted(() => {
    unListerFn = ipc.on('menu:update', (_, _menu) => {
      console.log(_menu)
      allMenu.value = _menu
      buttonWidthMap.clear()
    })
  })
  onUnmounted(() => {
    unListerFn()
  })
  return {
    menu,
    menuHandler: (item: MenuItem) => {
      console.log(item)
    },
    getRemainingWidth: (ev: MountEvent) => {
      remainingWidth.value = ev.width
    },
    getAllRemainingWidth: (ev: MountEvent) => {
      allRemainingWidth.value = ev.width
    },
    getSingleWidth: (ev: MountEvent) => {
      buttonWidthMap.set(ev.item.label, ev.width)
    },
    showRemaining,
    showAllRemaining,
    remainingMenu: remainingSubmenu,
    allRemainingMenu: allRemainingSubmenu
  }
}
