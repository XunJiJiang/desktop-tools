import Database from '@tauri-apps/plugin-sql'
import accountBookCreateSql from '@/assets/sql/account-book-create.sql?raw'

export async function initDb() {
  // sqlite数据库，路径相对于tauri::api::path::BaseDirectory::App
  const db = await Database.load('sqlite:database.db')
  return db
}

initDb()
  .then((db) => {
    return db.execute(accountBookCreateSql)
  })
  .then(() => {})
  .catch((err) => {
    console.error(err)
  })
