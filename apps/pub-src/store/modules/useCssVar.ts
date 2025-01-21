import { defineStore } from 'pinia'
import { shallowReactive } from 'vue'

export const useCssVar = defineStore('cssVar', () => {
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
    vars
  }
})
