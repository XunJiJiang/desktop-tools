/**
 * tooltip
 * 单例
 * 没有过渡动画
 */

// TODO: left 和 right 横向边缘定位优化, top 和 bottom 纵向边缘定位优化

import { createVNode, render, type Directive } from 'vue'
import { useMountElement } from '@apps/hooks/useMountElement'
import ToolTip, { type TooltipProps } from './ToolTip.vue'

const root = useMountElement('tooltip-root')

/** 移除上一次渲染 ToolTip 的元素 同时用于判断是否存在 tooltip */
let ele: HTMLElement | null = null

/** 元素和对应的remove函数, 显示和隐藏的times延时 */
const map = new Map<
  HTMLElement,
  {
    remove: () => void
    showTimeout: number
    hideTimeout: number
  }
>()

/** 元素和对应的hover */
const hoverMap = new Map<HTMLElement, (event: MouseEvent) => void>()

/** 立刻渲染 */
const showToolTip = (props: TooltipProps, target: HTMLElement) => {
  const item = map.get(target)
  if (item) {
    item.remove()
    clearTimeout(item.showTimeout)
    clearTimeout(item.hideTimeout)
    item.remove = () => {}
  }

  if (ele) {
    const item = map.get(ele)
    if (item) {
      item.remove()
      clearTimeout(item.showTimeout)
      clearTimeout(item.hideTimeout)
      item.remove = () => {}
    }
  }

  const vnode = createVNode(ToolTip, props)
  render(vnode, root)
  map.set(target, {
    remove: () => {
      if (ele !== target) return
      render(null, root)
      ele = null
    },
    showTimeout: 0,
    hideTimeout: 0
  })
}

const onHover = (
  event: MouseEvent,
  msg: string,
  position: TooltipProps['position']
) => {
  const target = event.target as HTMLElement
  const props: TooltipProps = {
    message: msg,
    position,
    target: {
      y: target.offsetTop,
      x: target.offsetLeft,
      width: target.offsetWidth,
      height: target.offsetHeight
    }
  }

  if (ele) {
    showToolTip(props, target)
    ele = target
  } else {
    map.set(target, {
      remove: () => {},
      showTimeout: setTimeout(() => {
        showToolTip(props, target)
        ele = target
      }, 1000),
      hideTimeout: 0
    })
  }
}

const onLeave = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const item = map.get(target)
  if (item) {
    clearTimeout(item.showTimeout)
    item.hideTimeout = setTimeout(() => {
      item.remove()
    }, 100)
  }
}

export default {
  name: 'tooltip',
  mounted(el, binding) {
    const [msg, position] = binding.value
    hoverMap.set(el, (event) => {
      onHover(event, msg, position)
    })
    el.addEventListener('mouseenter', hoverMap.get(el)!)
    el.addEventListener('mouseleave', onLeave)
  },
  updated(el, binding) {
    const [msg, position] = binding.value
    el.removeEventListener('mouseenter', hoverMap.get(el)!)
    hoverMap.set(el, (event) => {
      onHover(event, msg, position)
    })
    el.addEventListener('mouseenter', hoverMap.get(el)!)
  },
  unmounted(el) {
    el.removeEventListener('mouseenter', hoverMap.get(el)!)
    el.removeEventListener('mouseleave', onLeave)
    hoverMap.delete(el)
    const item = map.get(el)
    if (item) {
      item.remove()
      clearTimeout(item.showTimeout)
      clearTimeout(item.hideTimeout)
    }
    map.delete(el)
  }
} as Directive<HTMLElement, [string, TooltipProps['position']]>
