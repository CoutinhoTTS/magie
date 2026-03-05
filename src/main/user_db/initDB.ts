export function initProjectDB(sqlite) {
  sqlite.prepare(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    parent_id INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
    updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
  )
`).run()
}

export function initPagesDB(sqlite) {
  sqlite.prepare(`
  CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    project_id INTEGER,
    content TEXT DEFAULT '[]',
    created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
    updated_at INTEGER DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  )
`).run()
}

export function initModelDB(sqlite) {
  sqlite.prepare(`
  CREATE TABLE IF NOT EXISTS models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    compatible_type TEXT NOT NULL,
    api_key TEXT NOT NULL,
    selected INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
    updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
  )
`).run()
}

export function initLocalDB(sqlite) {
  sqlite.prepare(`
  CREATE TABLE IF NOT EXISTS local (
     open_left_side BOOLEAN,
     left_side_width INTEGER,
     open_right_side BOOLEAN,
     right_side_width INTEGER,
     open_chat_side BOOLEAN,
     chat_side_width INTEGER
 )
`).run()
}
