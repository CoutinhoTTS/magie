export function initChatMessagesDB(sqlite) {
  sqlite.prepare(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'normal',
    state TEXT DEFAULT 'end',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run()
}

export function initSessionSummaryDB(sqlite) {
  sqlite.prepare(`
  CREATE TABLE IF NOT EXISTS session_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_count INTEGER DEFAULT 0,
    description TEXT DEFAULT '',
    summary_json TEXT DEFAULT '{}',
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run()
}

export function initSummaryCursorDB(sqlite) {
  sqlite.prepare(`
  CREATE TABLE IF NOT EXISTS summary_cursor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    last_message_id INTEGER NOT NULL
  )
`).run()
}

export function initWorkingMemorySnapshotDB(sqlite) {
  sqlite.prepare(`
  CREATE TABLE IF NOT EXISTS working_memory_snapshot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    snapshot_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run()
}
