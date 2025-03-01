import { customRef } from 'vue'

export const useDebouncedRef = <T>(value: T, delay = 300) => {
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

export const useThrottleRef = <T>(value: T, delay = 300) => {
  let lastTime = Date.now() - delay - 1
  return customRef<T>((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        const now = Date.now()
        if (now - lastTime > delay) {
          value = newValue
          trigger()
          lastTime = now
        }
      }
    }
  })
}
