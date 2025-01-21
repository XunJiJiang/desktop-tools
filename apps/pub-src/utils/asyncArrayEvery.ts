export const asyncArrayEvery = async <T extends Array<unknown>>(
  array: T,
  callback: (value: T[number], index: number, array: T) => Promise<boolean>
): Promise<boolean> => {
  const len = array.length
  for (let i = 0; i < len; i++) {
    if (!(await callback(array[i], i, array))) {
      return false
    }
  }
  return true
}
