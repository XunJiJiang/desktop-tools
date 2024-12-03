import type { SelectReturn } from '@/db/types'
import { initDb } from './init'

/**
 * CREATE TABLE IF NOT EXISTS account_book_transaction (
 *   id INTEGER PRIMARY KEY AUTOINCREMENT,
 *   date TEXT NOT NULL,
 *   time TEXT NOT NULL,
 *   account_id INTEGER NOT NULL, -- 账户ID
 *   content TEXT NOT NULL,
 *   quantity INTEGER NOT NULL,
 *   status TEXT NOT NULL, -- 收入/支出
 *   remarks TEXT,
 *   currency TEXT NOT NULL, -- 货币类型
 *   category TEXT, -- 交易类别
 *   repeat TEXT, -- 重复交易设置
 *   attachment TEXT, -- 附件路径
 *   counterparty TEXT, -- 交易对方
 *   budget TEXT, -- 预算
 *   reminder TEXT, -- 提醒
 *   geolocation TEXT, -- 地理位置
 *   FOREIGN KEY (account_id) REFERENCES accounts(id)
 * );
 */

export interface Transaction {
  date: string
  time: string
  account_id: number
  content: string
  quantity: number
  status: string
  remarks: string
  currency: string
  category: string
  repeat: string
  attachment: string
  counterparty: string
  budget: string
  reminder: string
  geolocation: string
}

export const insert = async (transaction: Transaction) => {
  const db = await initDb()
  await db.execute(
    `INSERT INTO account_book_transaction (date, time, account_id, content, quantity, status, remarks, currency, category, repeat, attachment, counterparty, budget, reminder, geolocation)
    VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      transaction.date,
      transaction.time,
      transaction.account_id,
      transaction.content,
      transaction.quantity,
      transaction.status,
      transaction.remarks,
      transaction.currency,
      transaction.category,
      transaction.repeat,
      transaction.attachment,
      transaction.counterparty,
      transaction.budget,
      transaction.reminder,
      transaction.geolocation
    ]
  )
}

export const get = async () => {
  const db = await initDb()
  return db.select<SelectReturn<Transaction>>(
    `SELECT * FROM account_book_transaction`
  )
}

export const getById = async (id: number) => {
  const db = await initDb()
  return db.select<SelectReturn<Transaction>>(
    `SELECT * FROM account_book_transaction WHERE id = ?`,
    [id]
  )
}

export const update = async (id: number, transaction: Transaction) => {
  const db = await initDb()
  await db.execute(
    `UPDATE account_book_transaction SET date = ?, time = ?, account_id = ?, content = ?, quantity = ?, status = ?, remarks = ?, currency = ?, category = ?, repeat = ?, attachment = ?, counterparty = ?, budget = ?, reminder = ?, geolocation = ? WHERE id = ?`,
    [
      transaction.date,
      transaction.time,
      transaction.account_id,
      transaction.content,
      transaction.quantity,
      transaction.status,
      transaction.remarks,
      transaction.currency,
      transaction.category,
      transaction.repeat,
      transaction.attachment,
      transaction.counterparty,
      transaction.budget,
      transaction.reminder,
      transaction.geolocation,
      id
    ]
  )
}

export const dbDelete = async (id: number) => {
  const db = await initDb()
  await db.execute(`DELETE FROM account_book_transaction WHERE id = ?`, [id])
}

export default {
  insert,
  get,
  getById,
  update,
  delete: dbDelete
} as const
