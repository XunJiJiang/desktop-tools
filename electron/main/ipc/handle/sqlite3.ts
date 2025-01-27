/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, ipcMain } from 'electron'
import { join } from 'node:path'
import { readFile } from 'node:fs'
// import sq from 'node:sqlite'
import SqDatabase from 'better-sqlite3'
import { resourcesPath } from '@ele/utils/resourcesPath'

const accountBookCreateSql = new Promise<string>((resolve) => {
  readFile(
    join(resourcesPath(), 'sql', 'account-book-create.sql'),
    'utf-8',
    (err, data) => {
      if (err) {
        console.error('Error reading account-book-create.sql:', err)
      }
      resolve(data)
    }
  )
})

const imagesSql = new Promise<string>((resolve) => {
  readFile(join(resourcesPath(), 'sql', 'images.sql'), 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading images.sql:', err)
    }
    resolve(data)
  })
})

type SupportedValueType = import('../../../../types/sqlite').SupportedValueType

type StatementResultingChanges =
  import('../../../../types/sqlite').StatementResultingChanges

type QueryParam = import('../../../../types/sqlite').QueryParam

type InsertParam = import('../../../../types/sqlite').InsertParam

type UpdateParam = import('../../../../types/sqlite').UpdateParam

type DeleteParam = import('../../../../types/sqlite').DeleteParam

// ;(async () => {
//   console.log('---------------')
//   console.log('accountBookCreateSql:', await accountBookCreateSql)
//   console.log('imagesSql:', await imagesSql)
// })()

class Database {
  private db: SqDatabase.Database | null = null

  private dbStatus: 'open' | 'close' | 'wait' = 'close'

  constructor() {}

  get state() {
    return this.dbStatus
  }

  async all(
    sql: string,
    params: SupportedValueType[],
    callback: (err: any, rows: any[]) => void
  ) {
    if (this.dbStatus !== 'open') {
      callback(new Error('Database is closed'), [])
      return []
    }
    return new Promise<unknown[]>((resolve, reject) => {
      try {
        const res = this.db?.prepare(sql).all(
          ...params
          // , (err, rows) => {
          // if (err) {
          //   callback(err, [])
          //   reject(err)
          // } else {
          //   callback(null, rows)
          //   resolve(rows)
          // }
          // }
        )
        callback(null, res ?? [])
        resolve(res ?? [])
      } catch (err) {
        callback(err, [])
        reject(err)
      }
    })
  }

  async run(
    sql: string,
    params: SupportedValueType[],
    callback: (err: any, res?: StatementResultingChanges) => void
  ): Promise<StatementResultingChanges | void> {
    if (this.dbStatus !== 'open') {
      callback(new Error('Database is closed'))
      return
    }
    return new Promise((resolve, reject) => {
      try {
        const res = this.db?.prepare(sql).run(
          ...params
          // , function (err) {
          // if (err) {
          //   callback(err)
          //   reject(err)
          // } else {
          //   callback(null, this)
          //   resolve(this)
          // }
          // }
        )
        callback(null, res)
        resolve(res)
      } catch (err) {
        callback(err)
        reject(err)
      }
    })
  }

  async open() {
    if (this.dbStatus !== 'close') return
    const acc = await accountBookCreateSql
    const img = await imagesSql
    return new Promise<void>((resolve, reject) => {
      this.dbStatus = 'wait'
      try {
        this.db = new SqDatabase(dbPath)
        this.db.pragma('journal_mode = WAL')
        this.db.exec('PRAGMA foreign_keys = ON').exec(acc).exec(
          img
          //   , function (err) {
          //   if (err) {
          //     console.error('Error creating tables:', err)
          //     that.dbStatus = 'close'
          //     reject(err)
          //   } else {
          //     that.dbStatus = 'open'
          //     resolve()
          //   }
          // }
        )
        this.dbStatus = 'open'
        resolve()
      } catch (err) {
        this.dbStatus = 'close'
        reject(err)
      }
    })
  }

  async close() {
    if (this.dbStatus !== 'open') return
    return new Promise<void>((resolve, reject) => {
      this.dbStatus = 'wait'
      try {
        this.db
          ?.close
          // (err) => {
          // if (err) {
          //   console.error('Error closing database:', err)
          //   this.dbStatus = 'open'
          //   reject(err)
          // } else {
          //   this.dbStatus = 'close'
          //   resolve()
          // }
          // }
          ()
        this.dbStatus = 'close'
        resolve()
      } catch (err) {
        this.dbStatus = 'open'
        reject(err)
      }
    })
  }

  query(param: QueryParam): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      this.all(param.sql, param.params ?? [], (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  insert(param: InsertParam): Promise<StatementResultingChanges | void> {
    return new Promise<StatementResultingChanges | void>((resolve, reject) => {
      const keys = Object.keys(param.data)
      const values = Object.values(param.data)
      const placeholders = keys.map(() => '?').join(',')
      const sql = `INSERT INTO ${param.table} (${keys.join(
        ','
      )}) VALUES (${placeholders})`

      this.run(sql, values, function (err, res) {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }

  update(param: UpdateParam): Promise<StatementResultingChanges | void> {
    return new Promise<StatementResultingChanges | void>((resolve, reject) => {
      const entries = Object.keys(param.data)
        .map((key) => `${key} = ?`)
        .join(',')
      const params = Object.values(param.data)
      const sql = `UPDATE ${param.table} SET ${entries} WHERE ${param.condition}`

      this.run(sql, params, function (err, res) {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }

  delete(param: DeleteParam): Promise<StatementResultingChanges | void> {
    return new Promise<StatementResultingChanges | void>((resolve, reject) => {
      const sql = `DELETE FROM ${param.table} WHERE ${param.condition}`

      this.run(sql, [], (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }
}

const userDataPath = app.getPath('userData')
const dbPath = join(userDataPath, 'sqliteDatabase.db')

const db = new Database()

const useSqlite = () => {
  ipcMain.handle('sq:open', async () => {
    await db.open()
  })

  ipcMain.handle('sq:close', async () => {
    db.close()
  })

  ipcMain.handle('sq:query', async (_, param: QueryParam) => {
    return db.query(param)
  })

  ipcMain.handle('sq:insert', async (_, param: InsertParam) => {
    return db.insert(param)
  })

  ipcMain.handle('sq:update', async (_, param: UpdateParam) => {
    return db.update(param)
  })

  ipcMain.handle('sq:delete', async (_, param: DeleteParam) => {
    return db.delete(param)
  })

  ipcMain.handle('sq:state', async () => {
    return db.state
  })
}

export default useSqlite
