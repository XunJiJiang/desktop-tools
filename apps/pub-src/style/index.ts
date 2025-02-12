import { shallowReactive } from 'vue'
import { singleRun } from '@/utils/singleRun'


const handle = {
  get: (target: Record<string, string>, key: string) => {
    return target[key] ?? 'inherit'
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
    get: (name: string) => style[name] ?? 'inherit',
    style: new Proxy(style, handle)
  }
})
