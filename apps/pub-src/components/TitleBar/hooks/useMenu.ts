import ipc from '@apps/utils/ipc'
import type MenuButton from '@comp/button/menuButton/MenuButton.vue'
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
  nextTick,
  type ComputedRef,
  useTemplateRef
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
  const hasMenuUpdate = ref(false)
  const menu = computed(() => {
    showRemaining.value = false
    showAllRemaining.value = false

    // 如果有菜单更新, 则直接返回空数组, 以清空旧的渲染
    // 并在下一个 tick 中将 hasMenuUpdate 置为 false, 以运行全部菜单的宽度重计算
    if (hasMenuUpdate.value) {
      nextTick(() => {
        hasMenuUpdate.value = false
      })
      return []
    }

    if (maxWidth.value && buttonWidthMap.size !== allMenu.value.length) {
      // 通过 hasMenuUpdate 确保清空旧的渲染, 因此此次渲染覆盖全部菜单
      // 返回全部菜单, 使全部 MenuButton 都渲染, 以获取宽度
      if (remainingWidth.value === 0) {
        showRemaining.value = true
      }
      if (allRemainingWidth.value === 0) {
        showAllRemaining.value = true
      }
      return allMenu.value
    } else if (allMenu.value.length >= 3) {
      // 此时 buttonWidthMap.size === allMenu.value.length, 全部菜单的宽度已经获取
      // 计算最大宽度下可以显示的菜单
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
      // 通常情况下 allMenu.value.length >= 3, 此处为特殊情况
      // 且此处仅作为保底方案, 不会出现在正常情况下
      console.warn(
        '[警告]apps/pub-src/components/TitleBar/hooks/useMenu.ts: allMenu.value.length < 3'
      )
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
      allMenu.value = _menu
      buttonWidthMap.clear()
      hasMenuUpdate.value = true
    })
  })
  onUnmounted(() => {
    unListerFn()
  })
  const menuListRef = useTemplateRef<InstanceType<typeof MenuButton>[]>(
    'menu-button-list-ref'
  )
  const menuRemainingRef = useTemplateRef<InstanceType<typeof MenuButton>>(
    'menu-button-remaining-ref'
  )
  const menuAllRemainingRef = useTemplateRef<InstanceType<typeof MenuButton>>(
    'menu-button-all-remaining-ref'
  )
  /** 是否允许hover打开菜单, 仅当存在打开的菜单时为true */
  const hoverShow = ref(false)
  return {
    menu,
    showHandler: (item: MenuItem) => {
      hoverShow.value = true
      if (item.submenu === remainingSubmenu.value) {
        menuListRef.value?.forEach((btn) => {
          btn.hide()
        })
        menuAllRemainingRef.value?.hide()
      } else if (item.submenu === allRemainingSubmenu.value) {
        menuListRef.value?.forEach((btn) => {
          btn.hide()
        })
        menuRemainingRef.value?.hide()
      } else {
        menuListRef.value?.forEach((btn, i) => {
          if (menu.value[i] !== item) {
            btn.hide()
          }
        })
        menuRemainingRef.value?.hide()
        menuAllRemainingRef.value?.hide()
      }
    },
    hideHandler: () => {
      hoverShow.value = false
    },
    hoverShow,
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
