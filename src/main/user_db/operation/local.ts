import type { ResultType } from '../../utils/result'
import type { LocalSettings } from '~/types'
import Result from '../../utils/result'
import db from '../db'
import * as schema from '../schema'

export async function getLocalData(): Promise<ResultType<LocalSettings>> {
  const result = new Result<LocalSettings>()
  let settings: LocalSettings | null = null
  let status = true
  let error = ''

  try {
    const rows = await db.select().from(schema.localSettings)

    if (rows.length === 0) {
      settings = {
        open_left_side: true,
        left_side_width: 0,
        open_right_side: false,
        open_chat_side: false,
        right_side_width: 0,
        chat_side_width: 0,
      }
    }
    else {
      const row = rows[0]
      settings = {
        open_left_side: row.open_left_side ?? true,
        left_side_width: row.left_side_width ?? 0,
        open_right_side: row.open_right_side ?? false,
        open_chat_side: row.open_chat_side ?? false,
        right_side_width: row.right_side_width ?? 0,
        chat_side_width: row.chat_side_width ?? 0,
      }
    }
  }
  catch (err: any) {
    status = false
    error = JSON.stringify(err)
  }

  return result.toJSON({
    status,
    data: status ? settings : null,
    message: error,
  })
}

export async function setLocalData(_event: any, { params }: { params: Partial<LocalSettings> }): Promise<ResultType<LocalSettings>> {
  const result = new Result<LocalSettings>()
  let status = true
  let error = ''

  try {
    const existing = await db.select().from(schema.localSettings)

    if (existing.length === 0) {
      // 创建新记录
      await db.insert(schema.localSettings).values(params)
    }
    else {
      // 更新现有记录（只更新传入的字段）
      await db.update(schema.localSettings).set(params)
    }

    // 返回更新后的设置
    return await getLocalData()
  }
  catch (err: any) {
    status = false
    error = JSON.stringify(err)
    return result.toJSON({
      status,
      data: null,
      message: error,
    })
  }
}
