import { deepEqual } from '@apps/utils/deepEqual'
import { wait } from '@apps/utils/wait'

const UN_RUN = Symbol('UN-RUN')

const includes = <T>(arr: T[], target: T): boolean => {
  for (const item of arr) {
    if (deepEqual(item, target)) return true
  }
  return false
}

/**
 * 自动重运行
 * 当函数返回值为非预期值时或者抛出异常时，自动重运行
 * @param callback
 * @param unexpected 非预期返回值
 * @param times 重试次数
 */
export const autoRerun = <T>(
  callback: () => T,
  unexpected: T[],
  times: number = 3
): T => {
  let result: T | typeof UN_RUN = UN_RUN
  if (times < 1) result = callback()
  for (let i = 0; i < times; i++) {
    try {
      result = callback()
      if (!includes(unexpected, result)) break
    } catch (e) {
      if (i === times - 1) throw new Error(`autoRerun failed: ${e}`)
    }
  }
  if (result === UN_RUN) throw new Error('autoRerun failed: undefined')
  return result
}

export const autoRerunSync = async <T>(
  callback: () => Promise<T>,
  unexpected: T[],
  times: number = 3,
  delay: number = 0
): Promise<T> => {
  let result: T | typeof UN_RUN = UN_RUN
  if (times < 1) result = await callback()
  for (let i = 0; i < times; i++) {
    try {
      result = await callback()
      if (!includes(unexpected, result)) break
    } catch (e) {
      if (i === times - 1) throw new Error(`autoRerun failed: ${e}`)
    } finally {
      await wait(delay)
    }
  }
  if (result === UN_RUN) throw new Error('autoRerun failed: undefined')
  return result
}
