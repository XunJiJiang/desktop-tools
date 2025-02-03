import { BrowserWindow } from "electron"

/** Map<[完整窗口], Set<[仅主窗口]>> */
const wins: Map<BrowserWindow, Set<BrowserWindow>> = new Map()

/** Map<[完整窗口], [workspace config path]> */
const fullWinWorkspaces: Map<BrowserWindow, string> = new Map()
/**
 * Map<[workspace config path], [完整窗口]>
 * 当某个 win 没有打开工作区而是 [workspace:temp] 时,
 * 不会记录到 workspaceFullWins 中
 */
const workspaceFullWins: Map<string, BrowserWindow> = new Map()

const useWindowStore = () => {
  return {
    wins,
    fullWinWorkspaces,
    workspaceFullWins
  }
}

export default useWindowStore
