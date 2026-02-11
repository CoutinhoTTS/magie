import { createDatabase } from '../utils/db'
import * as initDB from './initDB'
import * as schema from './schema'

const { db, sqlite } = createDatabase({
  envVarName: 'VITE_CHAT_DB_NAME',
  defaultName: 'chat.db',
  schema,
  initDB,
})

export default db
export { sqlite }
