/**
 * 仅运行一次函数并在后续调用中返回结果
 * 即使后续参数不同, 也会返回第一次调用的结果
 * @param callback
 * @returns
 */
export const singleRun = <T extends Array<unknown>, E> (
  callback: (...args: T) => E
) => {
  let hasRun = false
  let result: E
  return (...args: T) => {
    if (hasRun) return result
    hasRun = true
    return (result = callback(...args))
  }
}
