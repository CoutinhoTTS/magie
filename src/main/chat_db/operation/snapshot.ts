import type { ResultType } from '../../utils/result'
import type { SnapshotItem } from '~/types'
import { eq, desc } from 'drizzle-orm'
import db from '../db'
import Result from '../../utils/result'
import * as schema from '../schema'

/**
 * Save a new working memory snapshot
 */
export async function saveSnapshot(_event: any, { session_id, snapshot_json }: { session_id: string, snapshot_json: any }): Promise<ResultType<SnapshotItem>> {
  const result = new Result<SnapshotItem>()
  let status = true
  let message = 'success'
  let savedSnapshot: SnapshotItem | null = null

  try {
    const [inserted] = await db.insert(schema.workingMemorySnapshot)
      .values({ session_id, snapshot_json })
      .returning()

    savedSnapshot = {
      id: inserted.id,
      session_id: inserted.session_id,
      snapshot_json: inserted.snapshot_json,
      created_at: inserted.created_at ?? '',
    }
  }
  catch (err: any) {
    status = false
    message = JSON.stringify(err)
  }

  return result.toJSON({
    status,
    data: status ? savedSnapshot : null,
    message,
  })
}

/**
 * Get the latest snapshot for a session
 */
export async function getLatestSnapshot(_event: any, { session_id }: { session_id: string }): Promise<ResultType<SnapshotItem | null>> {
  const result = new Result<SnapshotItem | null>()
  let snapshot: SnapshotItem | null = null
  let status = true
  let error = ''

  try {
    const rows = await db.select()
      .from(schema.workingMemorySnapshot)
      .where(eq(schema.workingMemorySnapshot.session_id, session_id))
      .orderBy(desc(schema.workingMemorySnapshot.id))
      .limit(1)

    if (rows.length > 0) {
      const s = rows[0]
      snapshot = {
        id: s.id,
        session_id: s.session_id,
        snapshot_json: s.snapshot_json,
        created_at: s.created_at ?? '',
      }
    }
  }
  catch (err: any) {
    status = false
    error = JSON.stringify(err)
  }

  return result.toJSON({
    status,
    data: status ? snapshot : null,
    message: error,
  })
}

/**
 * Get all snapshots for a session
 */
export async function getSnapshots(_event: any, { session_id }: { session_id: string }): Promise<ResultType<SnapshotItem[]>> {
  const result = new Result<SnapshotItem[]>()
  let snapshots: SnapshotItem[] = []
  let status = true
  let error = ''

  try {
    const rows = await db.select()
      .from(schema.workingMemorySnapshot)
      .where(eq(schema.workingMemorySnapshot.session_id, session_id))
      .orderBy(desc(schema.workingMemorySnapshot.id))

    snapshots = rows.map(s => ({
      id: s.id,
      session_id: s.session_id,
      snapshot_json: s.snapshot_json,
      created_at: s.created_at ?? '',
    }))
  }
  catch (err: any) {
    status = false
    error = JSON.stringify(err)
  }

  return result.toJSON({
    status,
    data: status ? snapshots : null,
    message: error,
  })
}

/**
 * Delete all snapshots for a session
 */
export async function deleteSnapshots(_event: any, { session_id }: { session_id: string }): Promise<ResultType<boolean>> {
  const result = new Result<boolean>()
  let status = true
  let errorMessage = ''

  try {
    await db.delete(schema.workingMemorySnapshot)
      .where(eq(schema.workingMemorySnapshot.session_id, session_id))
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
