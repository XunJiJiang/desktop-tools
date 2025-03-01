export const localTime = () => {
  return new Date()
    .toLocaleString(void 0, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    .replace(/\//g, '-')
    .replace(',', '')
}
