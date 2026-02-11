export interface ProjectNode {
  id: number | null
  name: string
  icon: string
  parent_id: number | null
  sort_order: number
  children?: ProjectNode[]
}

export interface PageNode {
  id?: string
  name: string
  tagId: string
  children?: PageNode[]
}

export interface Page {
  id?: string
  name: string
  tagId: string
  children: PageNode[]
}

export interface ModelItem {
  id?: number
  name: string
  url: string
  compatible_type: 'OpenAI' | 'Anthropic' | 'Google'
  api_key: string
  selected?: boolean
}

export interface DataResult<T> {
  status: boolean
  message: string
  data?: T
}

// 统一的返回值类型
export interface ResultType<T> {
  status: boolean
  data: T | null
  message: string
}

export interface DbSetResponse {
  status: boolean
  message?: string
}

export interface LocalSettings {
  open_left_side: boolean
  left_side_width_percent: number
  open_right_side: boolean
  open_chat_side: boolean
  open_right_side_width_percent: number
  open_chat_side_width_percent: number
}

export interface MsgItem {
  id?: number
  role: string
  content: string
  type: 'normal' | 'error'
  state?: 'no' | 'ing' | 'end'
}

export type MsgItemOption = {
  [K in keyof Omit<MsgItem, 'role'>]?: MsgItem[K] | MsgItem[K][]
}

// Chat database types
export interface ChatMessageItem extends MsgItem {
  session_id: number
  created_at?: string
}

export interface SessionSummaryItem {
  id?: number
  session_id?: number
  description: string
  message_count: number
  summary_json: any
  updated_at: string
}

export interface SnapshotItem {
  id: number
  session_id: string
  snapshot_json: any
  created_at: string
}

export interface CursorItem {
  id: number
  session_id: string
  last_message_id: number
}
