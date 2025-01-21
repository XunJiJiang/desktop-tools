import Database from '@tauri-apps/plugin-sql'
import accountBookCreateSql from '@fu/assets/sql/account-book-create.sql?raw'
import imagesSql from '@fu/assets/sql/images.sql?raw'

export async function initDb() {
  // sqlite数据库，路径相对于tauri::api::path::BaseDirectory::App
  const db = await Database.load('sqlite:database.db')
  return db
}

initDb()
  .then((db) => {
    db.execute(accountBookCreateSql)
    db.execute(imagesSql)
  })
  .catch((err) => {
    console.error(err)
  })
