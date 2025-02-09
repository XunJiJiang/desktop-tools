const mountRoot = (() => {
  const root = document.createElement('div')
  root.className = '__float-mount-root__'
  root.id = '__float-mount-root__'
  root.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 0;
    height: 0;
    background: transparent;
    overflow: visible;
    pointer-events: none;
    z-index: 999999;
  `
  document.body.appendChild(root)
  return root
})()

type UseMountElementOptions = {
  interaction?: boolean,
  zIndex?: number
}

export const useMountElement = (id: string, opt?: UseMountElementOptions) => {
  const { interaction = false, zIndex = 0 } = opt || {}

  const container =
    mountRoot.querySelector<HTMLDivElement>(`#__float-${id}__`) ??
    (() => {
      const el = document.createElement('div')
      el.id = `__float-${id}__`
      el.className = `__float-${id}__`
      el.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        background: transparent;
        overflow: visible;
        z-index: ${zIndex};
        pointer-events: ${interaction ? 'auto' : 'none'};
      `
      mountRoot.appendChild(el)
      return el
    })()

  return container
}
