type Config = {
  fontSize?: number
  fontFamily?: string
}

export const getStringWidth = (str: string, config: Config = {}) => {
  const { fontSize = 16, fontFamily = 'Arial' } = config
  const span = document.createElement('span')
  span.style.visibility = 'hidden'
  span.style.fontSize = `${fontSize}px`
  span.style.fontFamily = fontFamily
  span.style.position = 'absolute'
  span.style.top = '-9999px'
  span.textContent = str
  document.body.appendChild(span)
  const width = span.offsetWidth
  document.body.removeChild(span)
  return width
}
