export const createAwaiter = <R = void, E = Error>() => {
  if (typeof Promise.withResolvers === 'function') {
    return Promise.withResolvers<R>()
  } else {
    let resolve: (value: R) => void = () => {}
    let reject: (reason?: E) => void = () => {}
    const promise = new Promise<R>((res, rej) => {
      resolve = res
      reject = rej
    })
    return { promise, resolve, reject }
  }
}
