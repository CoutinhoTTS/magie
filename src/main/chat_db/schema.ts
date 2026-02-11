import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  session_id: integer('session_id').notNull(),
  role: text('role').notNull(), // 'user', 'assistant', 'system'
  content: text('content').notNull(),
  type: text('type').notNull().$type<'normal' | 'error'>(), // 'normal', 'error'
  state: text('state').$type<'no' | 'ing' | 'end'>(), // 'no', 'ing', 'end'
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

export const sessionSummary = sqliteTable('session_summary', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  description: text('description').default(''),
  message_count: integer('message_count').default(0),
  summary_json: text('summary_json', { mode: 'json' }).notNull().default('{}'),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

export const summaryCursor = sqliteTable('summary_cursor', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  session_id: integer('session_id').notNull(),
  last_message_id: integer('last_message_id').notNull(),
}, (table) => ({
  sessionIdx: uniqueIndex('summary_cursor_session_id_idx').on(table.session_id),
}))

export const workingMemorySnapshot = sqliteTable('working_memory_snapshot', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  session_id: integer('session_id').notNull(),
  snapshot_json: text('snapshot_json', { mode: 'json' }).notNull().default('{}'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})


export type ChatMessage = typeof chatMessages.$inferSelect
export type NewChatMessage = typeof chatMessages.$inferInsert
export type SessionSummary = typeof sessionSummary.$inferSelect
export type NewSessionSummary = typeof sessionSummary.$inferInsert
export type SummaryCursor = typeof summaryCursor.$inferSelect
export type NewSummaryCursor = typeof summaryCursor.$inferInsert
export type WorkingMemorySnapshot = typeof workingMemorySnapshot.$inferSelect
export type NewWorkingMemorySnapshot = typeof workingMemorySnapshot.$inferInsert
