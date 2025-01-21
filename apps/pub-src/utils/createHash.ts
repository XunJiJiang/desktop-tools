export const createHash = (v: string) => {
  let hash = 0,
    i,
    chr
  if (v.length === 0) return '0'
  for (i = 0; i < v.length; i++) {
    chr = v.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0
  }
  return hash.toString(16)
}
