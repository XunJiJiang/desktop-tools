import type { SelectReturn } from '@apps/utils/db/types'
import { initDb } from '@apps/utils/db/init'

/**
 * -- 图片资源表
 * CREATE TABLE IF NOT EXISTS images (
 *   id INTEGER PRIMARY KEY AUTOINCREMENT,
 *   file_path TEXT NOT NULL, -- 图片文件路径
 *   upload_datetime INTEGER NOT NULL, -- 上传日期 	从 1970-01-01 00:00:00 UTC 算起的秒数
 *   description TEXT, -- 图片描述
 * );
 */

export interface Image {
  filePath: string
  uploadDatetime: number
  description: string
}

export const insert = async (image: Image) => {
  const db = await initDb()
  await db.execute(
    'INSERT INTO images (file_path, upload_datetime, description) VALUES (?, ?, ?)',
    [image.filePath, image.uploadDatetime, image.description]
  )
}

export const get = async (limit = 30, offset = 0) => {
  const db = await initDb()
  return db.select<SelectReturn<Image>>(
    'SELECT * FROM images LIMIT ? OFFSET ?',
    [limit, offset]
  )
}

export const getById = async (id: number) => {
  const db = await initDb()
  return db.select<SelectReturn<Image>>('SELECT * FROM images WHERE id = ?', [
    id
  ])
}

export const getByPath = async (file_path: string) => {
  const db = await initDb()
  return db.select<SelectReturn<Image>>(
    'SELECT * FROM images WHERE file_path = ?',
    [file_path]
  )
}

export const update = async (id: number, image: Image) => {
  const db = await initDb()
  await db.execute(
    'UPDATE images SET file_path = ?, upload_date = ?, description = ? WHERE id = ?',
    [image.filePath, image.uploadDatetime, image.description, id]
  )
}

export const dbDelete = async (id: number) => {
  const db = await initDb()
  await db.execute('DELETE FROM images WHERE id = ?', [id])
}

export default {
  insert,
  get,
  getById,
  update,
  delete: dbDelete
} as const
