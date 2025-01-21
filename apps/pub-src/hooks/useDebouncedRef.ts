import { customRef } from 'vue'

export default function useDebouncedRef<T>(value: T, delay = 300) {
  let timeout: number
  return customRef<T>((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      }
    }
  })
}
