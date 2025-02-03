/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 合并对象
 * 传入两个对象, 返回两个对象
 * 将对方的值不为undefined的属性而己方的值为undefined的属性合并到己方
 */
export function mergeObject<T extends object, U extends object>(
  obj1: T,
  obj2: U
): [T & U, T & U] {
  const newObj1 = { ...obj1 }
  const newObj2 = { ...obj2 }

  function deepMerge(_a: any, _b: any) {
    if (
      typeof _a !== 'object' ||
      typeof _b !== 'object' ||
      _a === null ||
      _b === null
    ) {
      if (_a === undefined) return [_b, _b]
      if (_b === undefined) return [_a, _a]
      return [_a, _b]
    }

    const a = { ..._a }
    const b = { ..._b }
    const keys = new Set([...Object.keys(_a), ...Object.keys(_b)])
    for (const key of keys) {
      if (a[key] === undefined && b[key] !== undefined) {
        a[key] = _b[key]
      } else if (a[key] !== undefined && b[key] === undefined) {
        b[key] = _a[key]
      } else if (Array.isArray(a[key]) && Array.isArray(b[key])) {
        // 不进行数组合并
      } else if (typeof a[key] === 'object' && typeof b[key] === 'object') {
        ;[a[key], b[key]] = deepMerge(a[key], b[key])
      }
    }
    return [a, b]
  }

  const [_newObj1, _newObj2] = deepMerge(newObj1, newObj2)

  return [_newObj1 as T & U, _newObj2 as T & U]
}
