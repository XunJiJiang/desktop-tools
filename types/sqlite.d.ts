export type SupportedValueType = null | number | bigint | string | Uint8Array

export interface StatementResultingChanges {
  changes: number | bigint
  lastInsertRowid: number | bigint
}

export interface QueryParam {
  sql: string
  params?: SupportedValueType[]
}

export interface InsertParam {
  table: string
  data: { [key: string]: SupportedValueType }
}

export interface UpdateParam {
  table: string
  data: { [key: string]: SupportedValueType }
  condition: string
}

export interface DeleteParam {
  table: string
  condition: string
}
