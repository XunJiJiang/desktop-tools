type Config = {
  fontSize?: string
  fontFamily?: string
  fontWidth?: string
}

export const getStringWidth = (str: string, config: Config = {}) => {
  const {
    fontSize = '16px',
    fontFamily = 'Arial',
    fontWidth = 'normal'
  } = config
  const span = document.createElement('span')
  span.style.visibility = 'hidden'
  span.style.fontSize = fontSize
  span.style.fontFamily = fontFamily
  span.style.fontWeight = fontWidth
  span.style.position = 'absolute'
  span.style.top = '-9999px'
  span.textContent = str
  document.body.appendChild(span)
  const width = span.offsetWidth
  document.body.removeChild(span)
  return width
}
