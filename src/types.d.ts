export interface ProjectNode {
  id: number | null
  name: string
  icon: string
  parent_id: number | null
  sort_order: number
  children?: ProjectNode[]
}

export interface PageNode {
  id: string
  name: string
  tagId: string
  children?: PageNode[]
}

export interface Page {
  id: string
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
