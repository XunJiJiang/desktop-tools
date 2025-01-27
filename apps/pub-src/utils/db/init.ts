import Database from '@tauri-apps/plugin-sql'

export async function initDb() {
  const db = await Database.load('sqlite:database.db')
  return db
}

initDb().catch((err) => {
  console.error(err)
})
