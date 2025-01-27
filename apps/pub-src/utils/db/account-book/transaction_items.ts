import type { SelectReturn } from '@apps/utils/db/types'
import { initDb } from '@apps/utils/db/init'

/**
 * -- 交易项表
 * CREATE TABLE IF NOT EXISTS account_book_transaction_items (
 *   id INTEGER PRIMARY KEY AUTOINCREMENT,
 *   group_id INTEGER NOT NULL, -- 交易组ID
 *   content TEXT NOT NULL, -- 内容
 *   unit_price TEXT, -- 单价(非必须)
 *   attachment TEXT, -- 附件路径, 多个附件用逗号分隔
 *   quantity TEXT NOT NULL, -- 数量
 *   remarks TEXT, -- 备注
 *   FOREIGN KEY (group_id) REFERENCES account_book_transaction_groups(id) ON DELETE RESTRICT
 * );
 */

export interface TransactionItem {
  groupId: number
  content: string
  unitPrice: string
  attachment: string
  quantity: string
  remarks: string
}

interface DBTransactionItem {
  id: number
  group_id: number
  content: string
  unit_price: string
  attachment: string
  quantity: string
  remarks: string
}

const mapDBToJs = (dbTransactions: DBTransactionItem[]): TransactionItem[] => {
  return dbTransactions.map(({ group_id, unit_price, ...props }) => ({
    groupId: group_id,
    unitPrice: unit_price,
    ...props
  }))
}

export const insert = async (transactionItem: TransactionItem) => {
  const db = await initDb()
  await db.execute(
    `INSERT INTO account_book_transaction_items (group_id, content, unit_price, attachment, quantity, remarks) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      transactionItem.groupId,
      transactionItem.content,
      transactionItem.unitPrice,
      transactionItem.attachment,
      transactionItem.quantity,
      transactionItem.remarks
    ]
  )
}

export const get = async (limit = 30, offset = 0) => {
  const db = await initDb()
  return db
    .select<
      SelectReturn<DBTransactionItem>
    >(`SELECT * FROM account_book_transaction_items LIMIT ? OFFSET ?`, [limit, offset])
    .then(mapDBToJs)
}

export const getById = async (id: number) => {
  const db = await initDb()
  return db
    .select<
      SelectReturn<DBTransactionItem>
    >(`SELECT * FROM account_book_transaction_items WHERE id = ?`, [id])
    .then(mapDBToJs)
}

/**
 * 基于交易组ID获取交易项
 * @param groupId
 * @param limit
 * @param offset
 * @returns
 */
export const getByGroupId = async (groupId: number, limit = 30, offset = 0) => {
  const db = await initDb()
  return db
    .select<
      SelectReturn<DBTransactionItem>
    >(`SELECT * FROM account_book_transaction_items WHERE group_id = ? LIMIT ? OFFSET ?`, [groupId, limit, offset])
    .then(mapDBToJs)
}

/**
 * 基于内容和备注进行搜索
 * @param searchTerm
 * @param limit
 * @param offset
 * @returns
 */
export const searchByContentAndRemarks = async (
  searchTerm: string,
  limit = 30,
  offset = 0
) => {
  const db = await initDb()
  return db
    .select<
      SelectReturn<DBTransactionItem>
    >(`SELECT * FROM account_book_transaction_items WHERE content LIKE ? OR remarks LIKE ? LIMIT ? OFFSET ?`, [`%${searchTerm}%`, `%${searchTerm}%`, limit, offset])
    .then(mapDBToJs)
}

export const update = async (id: number, transactionItem: TransactionItem) => {
  const db = await initDb()
  await db.execute(
    `UPDATE account_book_transaction_items SET group_id = ?, content = ?, unit_price = ?, attachment = ?, quantity = ?, remarks = ? WHERE id = ?`,
    [
      transactionItem.groupId,
      transactionItem.content,
      transactionItem.unitPrice,
      transactionItem.attachment,
      transactionItem.quantity,
      transactionItem.remarks,
      id
    ]
  )
}

export const dbDelete = async (id: number) => {
  const db = await initDb()
  await db.execute(`DELETE FROM account_book_transaction_items WHERE id = ?`, [
    id
  ])
}

export default {
  insert,
  get,
  getById,
  update,
  delete: dbDelete
} as const
