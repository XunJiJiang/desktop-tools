export type DeepPartial<T> = T extends object
  ? T extends Array<unknown>
    ? T
    : { [K in keyof T]?: DeepPartial<T[K]> }
  : T
