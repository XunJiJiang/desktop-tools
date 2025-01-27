import type { SelectReturn, TagGroup } from '@apps/utils/db/types'
import { initDb } from '@apps/utils/db/init'

/**
 * -- 标签表
 * CREATE TABLE IF NOT EXISTS account_book_[group/item]_tags (
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

export const insert = async (tag: Tag, type: TagGroup) => {
  const db = await initDb()
  await db.execute(
    `INSERT INTO account_book_${type}_tags (name, color) VALUES (?, ?)`,
    [tag.name, tag.color]
  )
}

export const get = async (type: TagGroup, limit = 30, offset = 0) => {
  const db = await initDb()
  return db.select<SelectReturn<Tag>>(
    `SELECT * FROM account_book_${type}_tags LIMIT ? OFFSET ?`,
    [limit, offset]
  )
}

export const getById = async (id: number, type: TagGroup) => {
  const db = await initDb()
  return db.select<SelectReturn<Tag>>(
    `SELECT * FROM account_book_${type}_tags WHERE id = ?`,
    [id]
  )
}

export const getByName = async (
  name: string,
  type: TagGroup,
  limit = 30,
  offset = 0
) => {
  const db = await initDb()
  return db.select<SelectReturn<Tag>>(
    `SELECT * FROM account_book_${type}_tags WHERE name = ? LIMIT ? OFFSET ?`,
    [name, limit, offset]
  )
}

export const getByColor = async (
  color: string,
  type: TagGroup,
  limit = 30,
  offset = 0
) => {
  const db = await initDb()
  return db.select<SelectReturn<Tag>>(
    `SELECT * FROM account_book_${type}_tags WHERE color = ? LIMIT ? OFFSET ?`,
    [color, limit, offset]
  )
}

export const update = async (id: number, tag: Tag, type: TagGroup) => {
  const db = await initDb()
  await db.execute(
    `UPDATE account_book_${type}_tags SET name = ?, color = ? WHERE id = ?`,
    [tag.name, tag.color, id]
  )
}

export const dbDelete = async (id: number, type: TagGroup) => {
  const db = await initDb()
  await db.execute(`DELETE FROM account_book_${type}_tags WHERE id = ?`, [id])
}

export const group = {
  insert: (tag: Tag) => insert(tag, 'group'),
  get: () => get('group'),
  getById: (id: number) => getById(id, 'group'),
  update: (id: number, tag: Tag) => update(id, tag, 'group'),
  delete: (id: number) => dbDelete(id, 'group')
} as const

export const item = {
  insert: (tag: Tag) => insert(tag, 'item'),
  get: () => get('item'),
  getById: (id: number) => getById(id, 'item'),
  update: (id: number, tag: Tag) => update(id, tag, 'item'),
  delete: (id: number) => dbDelete(id, 'item')
} as const

export default {
  group,
  item
} as const
