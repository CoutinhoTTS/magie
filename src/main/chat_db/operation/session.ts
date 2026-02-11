import type { ResultType } from '../../utils/result'
import type { SessionSummaryItem } from '~/types'
import { desc, eq, like } from 'drizzle-orm'
import db from '../db'
import Result from '../../utils/result'
import * as schema from '../schema'

/**
 * Save or update session summary using upsert
 */


function mapSummary(val: SessionSummaryItem) {
  return {
    session_id: val.id,
    description: val.description ?? '',
    message_count: val.message_count ?? 0,
    summary_json: val.summary_json,
    updated_at: val.updated_at ?? '',
  }
}
export async function saveSessionSummary(_event: any, parmas: { session_id?: number, summary_json?: any, description?: string }): Promise<ResultType<SessionSummaryItem>> {
  const result = new Result<SessionSummaryItem>()
  let status = true
  let message = 'success'
  let savedSummary: SessionSummaryItem | null = null
  const session_id = parmas?.session_id;
  Reflect.deleteProperty(parmas, 'session_id')
  try {
    const [saved] = await db.insert(schema.sessionSummary)
      .values({ ...parmas, ...(session_id && { id: session_id }) })
      .onConflictDoUpdate({
        target: schema.sessionSummary.id,
        set: parmas,
      })
      .returning()
    savedSummary = mapSummary(saved as SessionSummaryItem)
  }
  catch (err: any) {
    status = false
    message = JSON.stringify(err)
  }
  return result.toJSON({
    status,
    data: status ? savedSummary : null,
    message,
  })
}

/**
 * Get session summary by session_id
 */
export async function getSessionSummary(_event: any, { session_id }: { session_id: number }): Promise<ResultType<SessionSummaryItem | null>> {
  const result = new Result<SessionSummaryItem | null>()
  let summary: SessionSummaryItem | null = null
  let status = true
  let error = ''

  try {
    const rows = await db.select()
      .from(schema.sessionSummary)
      .where(eq(schema.sessionSummary.id, session_id))
      .limit(1)

    if (rows.length > 0) {
      const s = rows[0]
      summary = mapSummary(s as SessionSummaryItem)
    }
  }
  catch (err: any) {
    status = false
    error = JSON.stringify(err)
  }

  return result.toJSON({
    status,
    data: status ? summary : null,
    message: error,
  })
}

/**
 * Get session list with pagination and keyword search
 */
export async function getSessionList(_event: any, params: { pageNo: number, pageSize: number, keyword?: string }): Promise<ResultType<SessionSummaryItem[]>> {
  const result = new Result<SessionSummaryItem[]>()
  let sessions: SessionSummaryItem[] = []
  let status = true
  let error = ''
  const { pageNo = 1, pageSize = 20, keyword = '' } = params
  const offset = (pageNo - 1) * pageSize

  try {
    const rows = await db
      .select()
      .from(schema.sessionSummary)
      .where(keyword ? like(schema.sessionSummary.description, `%${keyword}%`) : undefined)
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(schema.sessionSummary.updated_at))

    sessions = rows.map(s => mapSummary(s as SessionSummaryItem))
  }
  catch (err: any) {
    status = false
    error = JSON.stringify(err)
  }

  return result.toJSON({
    status,
    data: status ? sessions : null,
    message: error,
  })
}

