export type WithId<T> = T & { id: number }

export type SelectReturn<T> = WithId<T>[]
