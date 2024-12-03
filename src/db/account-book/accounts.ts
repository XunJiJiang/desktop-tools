import type { SelectReturn } from '@/db/types'
import { initDb } from './init'

/**
 * -- 账户表
 * CREATE TABLE IF NOT EXISTS accounts (
 *   id INTEGER PRIMARY KEY AUTOINCREMENT,
 *   name TEXT NOT NULL, -- 账户名称，如银行卡、微信、支付宝等
 *   type TEXT NOT NULL, -- 账户类型
 *    icon TEXT NOT NULL -- 账户图标
 * );
 */

export interface Account {
  name: string
  type: string
  icon: string
}

export const insert = async (account: Account) => {
  const db = await initDb()
  await db.execute(`INSERT INTO accounts (name, type, icon) VALUES (?, ?, ?)`, [
    account.name,
    account.type,
    account.icon
  ])
}

export const get = async () => {
  const db = await initDb()
  return db.select<SelectReturn<Account>>(`SELECT * FROM accounts`)
}

export const getById = async (id: number) => {
  const db = await initDb()
  return db.select<SelectReturn<Account>>(
    `SELECT * FROM accounts WHERE id = ?`,
    [id]
  )
}

export const update = async (id: number, account: Account) => {
  const db = await initDb()
  await db.execute(
    `UPDATE accounts SET name = ?, type = ?, icon = ?, WHERE id = ?`,
    [account.name, account.type, account.icon, id]
  )
}

export const dbDelete = async (id: number) => {
  const db = await initDb()
  await db.execute(`DELETE FROM accounts WHERE id = ?`, [id])
}

export default {
  insert,
  get,
  getById,
  update,
  delete: dbDelete
} as const
