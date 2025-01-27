import type { SelectReturn, TagGroup } from '@apps/utils/db/types'
import { initDb } from '@apps/utils/db/init'

/**
 * -- 交易标签表（多对多关系）
 * CREATE TABLE IF NOT EXISTS account_book_transaction_[group/item]_tags (
 *   transaction_id INTEGER NOT NULL,
 *   tag_id INTEGER NOT NULL,
 *   FOREIGN KEY (transaction_id) REFERENCES account_book_transaction(id),
 *   FOREIGN KEY (tag_id) REFERENCES account_book_tags(id),
 *   PRIMARY KEY (transaction_id, tag_id)
 * );
 */

export interface TransactionTag {
  transactionId: number
  tagId: number
}

interface DBTransactionTag {
  transaction_id: number
  tag_id: number
}

const mapDBToJs = (dbTransactions: DBTransactionTag[]): TransactionTag[] => {
  return dbTransactions.map(({ transaction_id, tag_id }) => ({
    transactionId: transaction_id,
    tagId: tag_id
  }))
}

export const insert = async (
  transactionId: number,
  tagId: number,
  type: TagGroup
) => {
  const db = await initDb()
  await db.execute(
    `INSERT INTO account_book_transaction_${type}_tags (transaction_id, tag_id) VALUES (?, ?)`,
    [transactionId, tagId]
  )
}

export const get = async (type: TagGroup, limit = 30, offset = 0) => {
  const db = await initDb()
  return db
    .select<
      SelectReturn<DBTransactionTag>
    >(`SELECT * FROM account_book_transaction_${type}_tags LIMIT ? OFFSET ?`, [limit, offset])
    .then(mapDBToJs)
}

/**
 * 基于 transactionId 和 tagId 获取记录
 * @param transactionId
 * @param tagId
 * @param type
 * @returns
 */
export const getById = async (
  transactionId: number,
  tagId: number,
  type: TagGroup,
  limit = 30,
  offset = 0
) => {
  const db = await initDb()
  return db
    .select<
      SelectReturn<DBTransactionTag>
    >(`SELECT * FROM account_book_transaction_${type}_tags WHERE transaction_id = ? AND tag_id = ? LIMIT ? OFFSET ?`, [transactionId, tagId, limit, offset])
    .then(mapDBToJs)
}

/**
 * 基于 transactionId 获取记录
 * @param transactionId
 * @param type
 * @param limit
 * @param offset
 * @returns
 */
export const getByTransactionId = async (
  transactionId: number,
  type: TagGroup,
  limit = 30,
  offset = 0
) => {
  const db = await initDb()
  return db
    .select<
      SelectReturn<DBTransactionTag>
    >(`SELECT * FROM account_book_transaction_${type}_tags WHERE transaction_id = ? LIMIT ? OFFSET ?`, [transactionId, limit, offset])
    .then(mapDBToJs)
}

/**
 * 基于 tagId 获取记录
 * @param tagId
 * @param type
 * @param limit
 * @param offset
 * @returns
 */
export const getByTagId = async (
  tagId: number,
  type: TagGroup,
  limit = 30,
  offset = 0
) => {
  const db = await initDb()
  return db
    .select<
      SelectReturn<DBTransactionTag>
    >(`SELECT * FROM account_book_transaction_${type}_tags WHERE tag_id = ? LIMIT ? OFFSET ?`, [tagId, limit, offset])
    .then(mapDBToJs)
}

export const dbDelete = async (
  transactionId: number,
  tagId: number,
  type: TagGroup
) => {
  const db = await initDb()
  await db.execute(
    `DELETE FROM account_book_transaction_${type}_tags WHERE transaction_id = ? AND tag_id = ?`,
    [transactionId, tagId]
  )
}

export const group = {
  insert: (transactionId: number, tagId: number) =>
    insert(transactionId, tagId, 'group'),
  get: (limit?: number, offset?: number) => get('group', limit, offset),
  getById: (transactionId: number, tagId: number) =>
    getById(transactionId, tagId, 'group'),
  getByTransactionId: (
    transactionId: number,
    limit?: number,
    offset?: number
  ) => getByTransactionId(transactionId, 'group', limit, offset),
  getByTagId: (tagId: number, limit?: number, offset?: number) =>
    getByTagId(tagId, 'group', limit, offset),
  delete: (transactionId: number, tagId: number) =>
    dbDelete(transactionId, tagId, 'group')
} as const

export const item = {
  insert: (transactionId: number, tagId: number) =>
    insert(transactionId, tagId, 'item'),
  get: (limit?: number, offset?: number) => get('item', limit, offset),
  getById: (transactionId: number, tagId: number) =>
    getById(transactionId, tagId, 'item'),
  getByTransactionId: (
    transactionId: number,
    limit?: number,
    offset?: number
  ) => getByTransactionId(transactionId, 'item', limit, offset),
  getByTagId: (tagId: number, limit?: number, offset?: number) =>
    getByTagId(tagId, 'item', limit, offset),
  delete: (transactionId: number, tagId: number) =>
    dbDelete(transactionId, tagId, 'item')
} as const

export default {
  group,
  item
} as const
