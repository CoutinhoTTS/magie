import type { ResultType } from '../../utils/result'
import type { ChatMessageItem } from '~/types'
import { eq } from 'drizzle-orm'
import Result from '../../utils/result'
import db from '../db'
import * as schema from '../schema'

/**
 * Add or update a chat message using upsert
 * - If id is provided and exists, update the message
 * - If id is not provided, insert a new message (auto-increment id)
 */
export async function addMessage(_event: any, params: ChatMessageItem): Promise<ResultType<ChatMessageItem>> {
  const result = new Result<ChatMessageItem>()
  let status = true
  let message = 'success'
  let savedMessage: ChatMessageItem | null = null

  try {
    const values = {
      role: params.role,
      content: params.content,
      session_id: params.session_id,
      type: params.type ?? 'normal',
      state: params.state ?? 'no',
    }

    const [saved] = await db.insert(schema.chatMessages)
      .values(params.id ? { ...values, id: params.id } : values)
      .onConflictDoUpdate({
        target: schema.chatMessages.id,
        set: values,
      })
      .returning()

    savedMessage = saved as ChatMessageItem
  }
  catch (err: any) {
    status = false
    message = JSON.stringify(err)
  }

  return result.toJSON({
    status,
    data: status ? savedMessage : null,
    message,
  })
}

/**
 * Get all messages for a session
 */
export async function getMessagesBySession(_event: any, { session_id }: { session_id: number }): Promise<ResultType<ChatMessageItem[]>> {
  const result = new Result<ChatMessageItem[]>()
  let messages: ChatMessageItem[] = []
  let status = true
  let error = ''
  try {
    const rows = await db.select()
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.session_id, session_id))
      .orderBy(schema.chatMessages.id)

    messages = rows as ChatMessageItem[]
  }
  catch (err: any) {
    status = false
    error = JSON.stringify(err)
  }

  return result.toJSON({
    status,
    data: status ? messages : null,
    message: error,
  })
}
