import type { SelectReturn } from '@/db/types'
import { initDb } from './init'

/**
 * -- 交易标签表（多对多关系）
 * CREATE TABLE IF NOT EXISTS account_book_transaction_tags (
 *   transaction_id INTEGER NOT NULL,
 *   tag_id INTEGER NOT NULL,
 *   FOREIGN KEY (transaction_id) REFERENCES account_book_transaction(id),
 *   FOREIGN KEY (tag_id) REFERENCES account_book_tags(id),
 *   PRIMARY KEY (transaction_id, tag_id)
 * );
 */

export const dbInsertTransactionTag = async (
  transactionId: number,
  tagId: number
) => {
  const db = await initDb()
  await db.execute(
    `INSERT INTO account_book_transaction_tags (transaction_id, tag_id) VALUES (?, ?)`,
    [transactionId, tagId]
  )
}

export const get = async () => {
  const db = await initDb()
  return db.select<
    SelectReturn<{
      transaction_id: number
      tag_id: number
    }>
  >(`SELECT * FROM account_book_transaction_tags`)
}

export const getById = async (transactionId: number, tagId: number) => {
  const db = await initDb()
  return db.select<
    SelectReturn<{
      transaction_id: number
      tag_id: number
    }>
  >(
    `SELECT * FROM account_book_transaction_tags WHERE transaction_id = ? AND tag_id = ?`,
    [transactionId, tagId]
  )
}

export const getByTransactionId = async (transactionId: number) => {
  const db = await initDb()
  return db.select<
    SelectReturn<{
      transaction_id: number
      tag_id: number
    }>
  >(`SELECT * FROM account_book_transaction_tags WHERE transaction_id = ?`, [
    transactionId
  ])
}

export const getByTagId = async (tagId: number) => {
  const db = await initDb()
  return db.select<
    SelectReturn<{
      transaction_id: number
      tag_id: number
    }>
  >(`SELECT * FROM account_book_transaction_tags WHERE tag_id = ?`, [tagId])
}

export const dbDelete = async (transactionId: number, tagId: number) => {
  const db = await initDb()
  await db.execute(
    `DELETE FROM account_book_transaction_tags WHERE transaction_id = ? AND tag_id = ?`,
    [transactionId, tagId]
  )
}

export default {
  insert: dbInsertTransactionTag,
  get,
  getById,
  getByTransactionId,
  getByTagId,
  delete: dbDelete
} as const
