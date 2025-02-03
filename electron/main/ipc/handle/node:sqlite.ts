/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, ipcMain } from 'electron'
import { join } from 'node:path'
import { readFile } from 'node:fs'
import sq from 'node:sqlite'
import { resourcesPath } from '@ele/utils/resourcesPath'
import { singleRun } from '@ele/utils/singleRun'
// import sq from 'sqlite3'

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

export type SupportedValueType = null | number | bigint | string | Uint8Array

export interface StatementResultingChanges {
  changes: number | bigint
  lastInsertRowid: number | bigint
}

export interface QueryParam {
  sql: string
  params?: SupportedValueType[]
}

export interface InsertParam {
  table: string
  data: { [key: string]: SupportedValueType }
}

export interface UpdateParam {
  table: string
  data: { [key: string]: SupportedValueType }
  condition: string
}

export interface DeleteParam {
  table: string
  condition: string
}

// ;(async () => {
//   console.log('---------------')
//   console.log('accountBookCreateSql:', await accountBookCreateSql)
//   console.log('imagesSql:', await imagesSql)
// })()

class Database {
  private db = new sq.DatabaseSync(dbPath, {
    open: false
  })

  private dbStatus: 'open' | 'close' | 'wait' = 'close'

  constructor() {}

  get state() {
    return this.dbStatus
  }

  all(
    sql: string,
    params: SupportedValueType[],
    callback: (err: any, rows: any[]) => void
  ) {
    if (this.dbStatus !== 'open') {
      callback(new Error('Database is closed'), [])
      return []
    }
    try {
      const run = this.db.prepare(sql)
      const res = run.all(...params)
      callback(null, res)
      return res
    } catch (err) {
      callback(err, [])
      return []
    }
  }

  run(
    sql: string,
    params: SupportedValueType[],
    callback: (err: any, res?: StatementResultingChanges) => void
  ): StatementResultingChanges | void {
    if (this.dbStatus !== 'open') {
      callback(new Error('Database is closed'))
      return
    }
    try {
      const run = this.db.prepare(sql)
      const res = run.run(...params)
      callback(null, res)
      return res
    } catch (err) {
      callback(err)
    }
  }

  async open() {
    if (this.dbStatus !== 'close') return
    this.dbStatus = 'wait'
    try {
      this.db.open()
      this.db.exec(await accountBookCreateSql)
      this.db.exec(await imagesSql)
      this.dbStatus = 'open'
    } catch (err) {
      console.error('Error opening database:', err)
      this.dbStatus = 'close'
    }
  }

  close() {
    if (this.dbStatus !== 'open') return
    this.dbStatus = 'wait'
    try {
      this.db.close()
      this.dbStatus = 'close'
    } catch (err) {
      console.error('Error closing database:', err)
      this.dbStatus = 'open'
    }
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

const useSqlite = singleRun(() => {
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
})

export default useSqlite
