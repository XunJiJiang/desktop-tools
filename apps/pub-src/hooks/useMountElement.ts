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
    width: 100%;
    height: 100%;
    background: transparent;
    overflow: visible;
    pointer-events: none;
    z-index: 999999;
  `
  document.body.appendChild(root)
  return root
})()

type UseMountElementOptions = {
  zIndex?: number
}

export const useMountElement = (id: string, opt?: UseMountElementOptions) => {
  const { zIndex = 0 } = opt || {}

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
        width: 100%;
        height: 100%;
        background: transparent;
        overflow: visible;
        z-index: ${zIndex};
        pointer-events: none;
      `
      mountRoot.appendChild(el)
      return el
    })()

  return container
}
