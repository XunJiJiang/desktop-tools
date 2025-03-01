/* eslint-disable @typescript-eslint/no-explicit-any */
export type Type =
  | 'click'
  | 'contextmenu'
  | 'dblclick'
  | 'mousedown'
  | 'mouseenter'
  | 'mouseleave'
  | 'mousemove'
  | 'mouseover'
  | 'mouseout'
  | 'mouseup'
  | 'resize'
  | 'keydown'
  | 'keypress'
  | 'keyup'
  | 'copy'
  | 'cut'

export const windowEvent = <T extends Type>(
  type: T,
  listener: (this: Window, ev: WindowEventMap[T]) => any,
  options?: boolean | AddEventListenerOptions
) => {
  window.addEventListener(type, listener, options)
  return () => window.removeEventListener(type, listener)
}
