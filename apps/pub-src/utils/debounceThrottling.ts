/* eslint-disable @typescript-eslint/no-explicit-any */
export const debounce = <T extends (...args: any[]) => unknown>(
  fn: T,
  delay: number = 300
) => {
  let timer: number | null = null
  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}

export const throttle = <T extends (...args: any[]) => unknown>(
  fn: T,
  delay: number = 300
) => {
  let timer: number | null = null
  return (...args: Parameters<T>) => {
    if (timer) {
      return
    }
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}
