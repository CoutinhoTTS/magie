import { createRequire } from 'node:module'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { app } from 'electron'

const require = createRequire(import.meta.url)
const Database = require('better-sqlite3')

export interface CreateDatabaseOptions {
  envVarName: keyof ImportMetaEnv
  defaultName: string
  schema: Record<string, unknown>
  initDB: Record<string, (sqlite: any) => void>
}

export function createDatabase(options: CreateDatabaseOptions) {
  const { envVarName, defaultName, schema, initDB } = options

  const dbName = import.meta.env?.[envVarName] || defaultName
  const userDataPath = app.getPath('userData')
  const dbPath = `${userDataPath}/${dbName}`

  const sqlite = new Database(dbPath)
  const db = drizzle(sqlite, { schema })

  Object.entries(initDB).forEach(([_name, fn]) => {
    fn(sqlite)
  })
  sqlite.pragma('foreign_keys = ON')

  return { db, sqlite }
}
