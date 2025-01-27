import { ipcMain } from 'electron'

const useWindow = () => {
  ipcMain.handle('window:webContent:id', (e) => {
    return e.sender.id
  })
}

export default useWindow
