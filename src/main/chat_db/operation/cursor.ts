import type { ResultType } from '../../utils/result'
import type { CursorItem } from '~/types'
import { eq } from 'drizzle-orm'
import Result from '../../utils/result'
import db from '../db'
import * as schema from '../schema'

/**
 * Update or create cursor for a session
 */
export async function updateCursor(_event: any, { session_id, last_message_id }: { session_id: string, last_message_id: number }): Promise<ResultType<CursorItem>> {
  const result = new Result<CursorItem>()
  let status = true
  let message = 'success'
  let savedCursor: CursorItem | null = null

  try {
    // Check if cursor exists for this session
    const existing = await db.select()
      .from(schema.summaryCursor)
      .where(eq(schema.summaryCursor.session_id, session_id))
      .limit(1)

    if (existing.length > 0) {
      // Update existing cursor
      const [updated] = await db.update(schema.summaryCursor)
        .set({ last_message_id })
        .where(eq(schema.summaryCursor.session_id, session_id))
        .returning()

      savedCursor = {
        id: updated.id,
        session_id: updated.session_id,
        last_message_id: updated.last_message_id,
      }
    }
    else {
      // Insert new cursor
      const [inserted] = await db.insert(schema.summaryCursor)
        .values({ session_id, last_message_id })
        .returning()

      savedCursor = {
        id: inserted.id,
        session_id: inserted.session_id,
        last_message_id: inserted.last_message_id,
      }
    }
  }
  catch (err: any) {
    status = false
    message = JSON.stringify(err)
  }

  return result.toJSON({
    status,
    data: status ? savedCursor : null,
    message,
  })
}

/**
 * Get cursor for a session
 */
export async function getCursor(_event: any, { session_id }: { session_id: string }): Promise<ResultType<CursorItem | null>> {
  const result = new Result<CursorItem | null>()
  let cursor: CursorItem | null = null
  let status = true
  let error = ''

  try {
    const rows = await db.select()
      .from(schema.summaryCursor)
      .where(eq(schema.summaryCursor.session_id, session_id))
      .limit(1)

    if (rows.length > 0) {
      const c = rows[0]
      cursor = {
        id: c.id,
        session_id: c.session_id,
        last_message_id: c.last_message_id,
      }
    }
  }
  catch (err: any) {
    status = false
    error = JSON.stringify(err)
  }

  return result.toJSON({
    status,
    data: status ? cursor : null,
    message: error,
  })
}

/**
 * Delete cursor for a session
 */
export async function deleteCursor(_event: any, { session_id }: { session_id: string }): Promise<ResultType<boolean>> {
  const result = new Result<boolean>()
  let status = true
  let errorMessage = ''

  try {
    await db.delete(schema.summaryCursor)
      .where(eq(schema.summaryCursor.session_id, session_id))
  }
  catch (err: any) {
    status = false
    errorMessage = JSON.stringify(err)
  }

  return result.toJSON({
    status,
    data: status ? true : null,
    message: errorMessage,
  })
}
