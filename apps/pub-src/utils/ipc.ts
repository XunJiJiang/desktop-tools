/* eslint-disable @typescript-eslint/no-explicit-any */

export const on = ((...args) => {
  return ipcRenderer.on(...args)
}) as Ipc.on

export const off = ((...args) => {
  return ipcRenderer.off(...args)
}) as Ipc.off

export const send = ((...args) => {
  return ipcRenderer.send(...args)
}) as Ipc.send

export const invoke = ((...args: any) => {
  return ipcRenderer.invoke(...args)
}) as Ipc.invoke

export const getPathForFile = ((file: File) => {
  return ipcRenderer.getPathForFile(file)
}) as Ipc.getPathForFile

const ipc = {
  on,
  off,
  send,
  invoke,
  getPathForFile
}

export default ipc
