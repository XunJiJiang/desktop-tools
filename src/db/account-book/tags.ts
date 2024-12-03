import type { SelectReturn } from '@/db/types'
import { initDb } from './init'

/**
 * -- 标签表
 * CREATE TABLE IF NOT EXISTS account_book_tags (
 *   id INTEGER PRIMARY KEY AUTOINCREMENT,
 *   name TEXT NOT NULL -- 标签名称
 *   color TEXT NOT NULL, -- 标签颜色
 *   icon TEXT NOT NULL -- 标签图标
 * );
 */

export interface Tag {
  name: string
  color: string
}

export const insert = async (tag: Tag) => {
  const db = await initDb()
  await db.execute(
    `INSERT INTO account_book_tags (name, color) VALUES (?, ?)`,
    [tag.name, tag.color]
  )
}

export const get = async () => {
  const db = await initDb()
  return db.select<SelectReturn<Tag>>(`SELECT * FROM account_book_tags`)
}

export const getById = async (id: number) => {
  const db = await initDb()
  return db.select<SelectReturn<Tag>>(
    `SELECT * FROM account_book_tags WHERE id = ?`,
    [id]
  )
}

export const update = async (id: number, tag: Tag) => {
  const db = await initDb()
  await db.execute(
    `UPDATE account_book_tags SET name = ?, color = ? WHERE id = ?`,
    [tag.name, tag.color, id]
  )
}

export const dbDelete = async (id: number) => {
  const db = await initDb()
  await db.execute(`DELETE FROM account_book_tags WHERE id = ?`, [id])
}

export default {
  insert,
  get,
  getById,
  update,
  delete: dbDelete
} as const
