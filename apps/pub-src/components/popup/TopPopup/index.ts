import { getStringWidth } from '@apps/utils/getStringWidth'
import { createBasePopup } from '../BasePopup'
import TopPopup from './TopPopup.vue'
import { createVNode } from 'vue'
import { useStyle } from '@apps/style'
import { singleRun } from '@/utils/singleRun'
import ipc from '@apps/utils/ipc'
import { debounce } from '@apps/utils/debounceThrottling'

let lastPopupController: ReturnType<typeof createBasePopup> | null = null
let timeout: number | null = null

export const createTopPopup = debounce(
  ({
    message,
    type = 'info'
  }: {
    message: string
    type?: 'info' | 'warning' | 'danger' | 'success'
  }) => {
    if (lastPopupController) {
      if (timeout) clearTimeout(timeout)
      lastPopupController.hide()
    }
    const style = useStyle()
    const messageWidth =
      getStringWidth(message, {
        fontSize: '14px',
        fontFamily: style.get('font-family')
      }) + 12
    lastPopupController = createBasePopup(
      createVNode(TopPopup, { message, type }),
      {
        y: 34,
        x: (window.innerWidth - messageWidth) / 2
      }
    )
    lastPopupController.show()
    timeout = setTimeout(() => {
      lastPopupController!.hide()
    }, 1500)
  },
  50
)

export const init = singleRun(() => {
  ipc.on('msg:create:top', (_, { message, type = 'info' }) => {
    createTopPopup({ message, type })
  })
})
