import { shallowReactive } from 'vue'
import { singleRun } from '@/utils/singleRun'

const handle = {
  get: (target: Record<string, string>, key: string) => {
    if (target[key] === undefined) {
      target[key] = 'inherit'
      return target[key]
    }
    return target[key]
  },
  set: (target: Record<string, string>, key: string, value: string) => {
    target[key] = value
    return true
  }
}

export const useStyle = singleRun((base: Record<string, string> = {}) => {
  const style = shallowReactive<Record<string, string>>(base)

  return {
    set: (name: string, value: string) => {
      style[name] = value
    },
    get: (name: string) => {
      return handle.get(style, name)
    },
    style: new Proxy(style, handle)
  }
})
