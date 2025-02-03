/* eslint-disable @typescript-eslint/no-explicit-any */
export const deepEqual = (a: any, b: any): boolean => {
  const map = new WeakMap()

  function _deepEqual(a: any, b: any): boolean {
    if (Object.is(a, b)) return true

    if (typeof a !== 'object' || typeof b !== 'object') return false

    if (a === null || b === null) return false

    if (map.has(a) && map.get(a) === b) return true

    if (Object.keys(a).length !== Object.keys(b).length) return false

    map.set(a, b)

    for (const key in a) {
      if (!_deepEqual(a[key], b[key])) return false
    }

    return true
  }

  return _deepEqual(a, b)
}
