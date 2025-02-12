import { ipcMain } from 'electron'
import { singleRun } from '@/utils/singleRun'

const useWindow = singleRun(() => {
  ipcMain.handle('window:webContent:id', (e) => {
    return e.sender.id
  })
})

export default useWindow
