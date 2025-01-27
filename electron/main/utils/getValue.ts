/* eslint-disable @typescript-eslint/no-explicit-any */
export const getValue = (
  obj: Record<string, any>,
  path: string,
  defaultValue?: any
) => {
  const keys = path.split('.')
  let result = obj
  for (const key of keys) {
    if (!isObject(result) || result[key] === void 0) {
      return defaultValue
    }
    result = result[key]
  }
  return result
}

const isObject = (obj: any) => {
  return obj !== null && typeof obj === 'object'
}
