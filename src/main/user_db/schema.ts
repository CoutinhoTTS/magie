import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  parent_id: integer('parent_id'),
  sort_order: integer('sort_order').notNull().default(1),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
})

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  tag_id: text('tag_id').notNull(),
  project_id: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  content: text('content', { mode: 'json' }).notNull().default('[]'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
})

export const models = sqliteTable('models', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  compatible_type: text('compatible_type').notNull(),
  api_key: text('api_key').notNull(),
  selected: integer('selected', { mode: 'boolean' }).notNull().default(false),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
})

export const localSettings = sqliteTable('local', {
  open_left_side: integer('open_left_side', { mode: 'boolean' }),
  left_side_width: integer('left_side_width'),
  open_right_side: integer('open_right_side', { mode: 'boolean' }),
  right_side_width: integer('right_side_width'),
  open_chat_side: integer('open_chat_side', { mode: 'boolean' }),
  chat_side_width: integer('chat_side_width'),
})

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type Page = typeof pages.$inferSelect
export type NewPage = typeof pages.$inferInsert
export type Model = typeof models.$inferSelect
export type NewModel = typeof models.$inferInsert
export type LocalSetting = typeof localSettings.$inferSelect
export type NewLocalSetting = typeof localSettings.$inferInsert
