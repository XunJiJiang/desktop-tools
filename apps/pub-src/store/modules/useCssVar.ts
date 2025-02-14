import { defineStore } from 'pinia'
import { shallowReactive } from 'vue'

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

export const useCssVar = defineStore('css-var', () => {
  const vars = shallowReactive<Record<string, string>>({})

  const setCssVars = (newVars: Record<string, string>) => {
    Object.keys(newVars).forEach((key) => {
      vars[key] = newVars[key]
    })
  }

  const setCssVar = (key: string, value: string) => {
    vars[key] = value
  }

  return {
    setCssVars,
    setCssVar,
    vars: new Proxy(vars, handle)
  }
})
