import { createRequire } from 'node:module'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { app } from 'electron'
import * as initDB from './initDB'
import * as schema from './schema'

const require = createRequire(import.meta.url)
const Database = require('better-sqlite3')

const env = import.meta.env
const dbName = env?.VITE_DB_NAME || 'magie.db'
const userDataPath = app.getPath('userData')
const dbPath = `${userDataPath}/${dbName}`

const sqlite = new Database(dbPath)
const db = drizzle(sqlite, { schema })

Object.entries(initDB).forEach(([_, fn]) => {
  fn(sqlite)
})
sqlite.pragma('foreign_keys = ON')

export default db
export { sqlite }
