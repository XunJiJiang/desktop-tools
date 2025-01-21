import type { SelectReturn } from '@fu/db/types'
import { initDb } from '@fu/db/init'

/**
 * -- 交易组表
 * CREATE TABLE IF NOT EXISTS account_book_transaction_groups (
 *   id INTEGER PRIMARY KEY AUTOINCREMENT,
 *   datetime INTEGER NOT NULL, -- 交易时间 从 1970-01-01 00:00:00 UTC 算起的秒数
 *   location TEXT, -- 地点
 *   status INTEGER NOT NULL, -- 状态 0: 支出 1: 收入 2: 无变动 (用于认定当前余额)
 *   remarks TEXT, -- 备注
 *   counterparty TEXT, -- 交易对方
 *   category TEXT, -- 交易类别
 *   currency TEXT NOT NULL, -- 货币类型
 *   total_amount TEXT NOT NULL, -- 总价
 *   account_id INTEGER NOT NULL, -- 账户ID
 *   FOREIGN KEY (account_id) REFERENCES accounts_book_accounts(id) ON DELETE RESTRICT
 * );
 */

enum TransactionStatus {
  Expense = 0,
  Income = 1,
  NoChange = 2
}

export interface TransactionGroup {
  datetime: number
  location: string
  status: TransactionStatus
  remarks: string
  counterparty: string
  category: string
  currency: string
  totalAmount: string
  accountId: number
}

interface DBTransactionGroup {
  datetime: number
  location: string
  status: TransactionStatus
  remarks: string
  counterparty: string
  category: string
  currency: string
  total_amount: string
  account_id: number
}

const mapDBToJs = (
  dbTransactions: DBTransactionGroup[]
): TransactionGroup[] => {
  return dbTransactions.map(({ total_amount, account_id, ...props }) => ({
    totalAmount: total_amount,
    accountId: account_id,
    ...props
  }))
}

export const insert = async (transactionGroup: TransactionGroup) => {
  const db = await initDb()
  await db.execute(
    `INSERT INTO account_book_transaction_groups (datetime, location, status, remarks, counterparty, category, currency, total_amount, account_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      transactionGroup.datetime,
      transactionGroup.location,
      transactionGroup.status,
      transactionGroup.remarks,
      transactionGroup.counterparty,
      transactionGroup.category,
      transactionGroup.currency,
      transactionGroup.totalAmount,
      transactionGroup.accountId
    ]
  )
}

/**
 * 基于位置, 备注, 交易对方进行搜索
 * @param input
 * @param limit
 * @param offset
 * @returns
 */
export const search = async (searchTerm: string, limit = 30, offset = 0) => {
  const db = await initDb()
  return db
    .select<
      SelectReturn<DBTransactionGroup>
    >(`SELECT * FROM account_book_transaction_groups WHERE location LIKE ? OR remarks LIKE ? OR counterparty LIKE ? LIMIT ? OFFSET ?`, [searchTerm, searchTerm, searchTerm, limit, offset])
    .then(mapDBToJs)
}

/**
 * 基于状态进行获取
 * @param status 0: 支出 1: 收入 2: 无变动 (用于认定当前余额)
 * @param limit
 * @param offset
 * @returns
 */
export const getByStatus = async (
  status: TransactionStatus,
  limit = 30,
  offset = 0
) => {
  const db = await initDb()
  return db
    .select<
      SelectReturn<DBTransactionGroup>
    >(`SELECT * FROM account_book_transaction_groups WHERE status = ? LIMIT ? OFFSET ?`, [status, limit, offset])
    .then(mapDBToJs)
}

/**
 * 基于账户ID进行获取
 * @param accountId
 * @param limit
 * @param offset
 * @returns
 */
export const getByAccount = async (
  accountId: number,
  limit = 30,
  offset = 0
) => {
  const db = await initDb()
  return db
    .select<
      SelectReturn<DBTransactionGroup>
    >(`SELECT * FROM account_book_transaction_groups WHERE account_id = ? LIMIT ? OFFSET ?`, [accountId, limit, offset])
    .then(mapDBToJs)
}

/**
 * 基于类别进行获取
 * @param category
 * @param limit
 * @param offset
 * @returns
 */
export const getByCategory = async (
  category: string,
  limit = 30,
  offset = 0
) => {
  const db = await initDb()
  return db
    .select<
      SelectReturn<DBTransactionGroup>
    >(`SELECT * FROM account_book_transaction_groups WHERE category = ? LIMIT ? OFFSET ?`, [category, limit, offset])
    .then(mapDBToJs)
}

/**
 * 基于货币类型进行获取
 * @param currency
 * @param limit
 * @param offset
 * @returns
 */
export const getByCurrency = async (
  currency: string,
  limit = 30,
  offset = 0
) => {
  const db = await initDb()
  return db
    .select<
      SelectReturn<DBTransactionGroup>
    >(`SELECT * FROM account_book_transaction_groups WHERE currency = ? LIMIT ? OFFSET ?`, [currency, limit, offset])
    .then(mapDBToJs)
}

export const get = async (limit = 30, offset = 0) => {
  const db = await initDb()
  return db
    .select<
      SelectReturn<DBTransactionGroup>
    >(`SELECT * FROM account_book_transaction_groups LIMIT ? OFFSET ?`, [limit, offset])
    .then(mapDBToJs)
}

export const getById = async (id: number) => {
  const db = await initDb()
  return db
    .select<
      SelectReturn<DBTransactionGroup>
    >(`SELECT * FROM account_book_transaction_groups WHERE id = ?`, [id])
    .then(mapDBToJs)
}

export const update = async (
  id: number,
  transactionGroup: TransactionGroup
) => {
  const db = await initDb()
  await db.execute(
    `UPDATE account_book_transaction_groups SET datetime = ?, location = ?, status = ?, remarks = ?, counterparty = ?, category = ?, currency = ?, total_amount = ?, account_id = ? WHERE id = ?`,
    [
      transactionGroup.datetime,
      transactionGroup.location,
      transactionGroup.status,
      transactionGroup.remarks,
      transactionGroup.counterparty,
      transactionGroup.category,
      transactionGroup.currency,
      transactionGroup.totalAmount,
      transactionGroup.accountId,
      id
    ]
  )
}

export const dbDelete = async (id: number) => {
  const db = await initDb()
  await db.execute(`DELETE FROM account_book_transaction_groups WHERE id = ?`, [
    id
  ])
}

export default {
  insert,
  search,
  getByStatus,
  getByAccount,
  getByCategory,
  getByCurrency,
  get,
  getById,
  update,
  delete: dbDelete
} as const
