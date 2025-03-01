import { on } from '@apps/utils/ipc'
import { onMounted, onUnmounted } from 'vue'

export const useIpcOn = (...args: Parameters<Ipc.on>) => {
  let unListen: Ipc.UnListen
  onMounted(() => {
    unListen = on(...args)
  })
  onUnmounted(() => {
    unListen()
  })
}
