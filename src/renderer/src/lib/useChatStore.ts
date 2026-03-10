import type { Chunk, MsgItem, MsgItemOption, ReasoningDeltaChunk, SessionSummaryItem, StructuredContent, TextDeltaChunk } from '~/types'
import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import useMoveable from './useMoveable'
import useProperty from './useProperty'

const invoke = window.api.invoke

interface patchItem {
  newValue: any
  oldValue: any
  prop: string
  reason: string
}

/**
 * 追加文本
 * 简单拼接，不做额外处理
 */
function appendText(currentText: string, newText: string): string {
  return `${currentText}${newText}`
}

export const useChatStore = defineStore('chat', () => {
  // State
  const session_id = ref<number | null>(null)
  const messages = ref<Array<MsgItem>>([])
  const sessionList = ref<Array<SessionSummaryItem>>([])
  const patchs = ref<patchItem[]>([])
  const workflowRunId = ref<string | null>(null)
  let patching: (() => void)[] = []

  async function getSessionList(keyword?: string) {
    const { data } = await invoke('chat_get_top_session_summary', {
      keyword,
    })
    sessionList.value = (data || [])
  }

  async function newSession(message: string) {
    const { data } = await invoke('chat_save_session_summary', {
      description: message,
      session_id: session_id.value || void 0,
      summary_json: '',
    })
    session_id.value = data?.session_id
    getSessionList()
  }

  async function addMessage(message: MsgItem) {
    await invoke('chat_add_message', {
      ...message,
      session_id: session_id.value,
    })
    const { data } = await invoke('chat_get_messages_by_session', { session_id: session_id.value })
    messages.value = data ?? []
  }

  function getLastAssistantMessage() {
    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i].role === 'assistant') {
        return messages.value[i]
      }
    }
    return null
  }

  function getAssistantIndex(option?: MsgItemOption): number {
    return messages.value.findLastIndex((msg) => {
      if (!option)
        return msg.role === 'assistant'
      return Object.entries(option).every(([key, value]) => {
        const msgValue = msg[key as keyof MsgItem]
        if (Array.isArray(value)) {
          return (value as readonly unknown[]).includes(msgValue)
        }
        return msgValue === value
      })
      && msg.role === 'assistant'
    })
  }

  async function getMessageListBySessionId() {
    const { data } = await invoke('chat_get_messages_by_session', {
      session_id: session_id.value,
    })
    messages.value = data
  }

  function localMessagePushChunk(chunk: Chunk, index: number) {
    const message = messages.value[index]
    message.state = 'ing'

    // 解析现有 content 或创建新的结构
    let structured: StructuredContent
    try {
      structured = JSON.parse(message.content || '{"chunks":[]}')
    }
    catch {
      structured = { chunks: [] }
    }

    // 根据 chunk 类型处理（需要同时匹配 runId 和 payload.id）
    const existingIndex = structured.chunks.findIndex(c => c.runId === chunk.runId && c.payload.id === chunk.payload.id)

    switch (chunk.type) {
      case 'text-delta':
        if (existingIndex >= 0) {
          const existingChunk = structured.chunks[existingIndex] as TextDeltaChunk
          existingChunk.payload.text = appendText(existingChunk.payload.text, chunk.payload.text)
        }
        else {
          structured.chunks.push(chunk)
        }
        break

      case 'reasoning-delta':
        if (existingIndex >= 0) {
          const existingChunk = structured.chunks[existingIndex] as ReasoningDeltaChunk
          existingChunk.payload.text = appendText(existingChunk.payload.text, chunk.payload.text)
        }
        else {
          structured.chunks.push(chunk)
        }
        break

      case 'tool-call':
        if (existingIndex >= 0) {
          // 更新工具调用
          structured.chunks[existingIndex] = chunk
        }
        else {
          structured.chunks.push(chunk)
        }
        break

      case 'finish':
        structured.chunks.push(chunk)
        break
    }

    messages.value[index].content = JSON.stringify(structured)
  }

  function createNewConversation() {
    messages.value = []
    session_id.value = null
  }

  function setSessionId(val) {
    session_id.value = val
    getMessageListBySessionId()
  }

  function startAgentChat(message: string) {
    const property = useProperty()
    const moveable = useMoveable()
    const rowPageDesignData = toRaw?.(moveable?.pageDesignData)
    const rowCurrentProperty = toRaw?.(property?.currentProperty)
    const pageDesignData = rowPageDesignData ? JSON.parse(JSON.stringify(rowPageDesignData)) : undefined
    const currentProperty = rowCurrentProperty ? JSON.parse(JSON.stringify(rowCurrentProperty)) : undefined

    invoke('agent_chat', {
      message,
      currentProperty,
      pageDesignData,
      // Memory 参数 - 用于保持对话上下文
      threadId: session_id.value ? String(session_id.value) : undefined,
      resourceId: 'default-user', // 可以改成实际的用户 ID
    })
  }

  function stopAgentChat() {
    invoke('agent_chat', false)
  }

  function setPatchs(value: patchItem[]) {
    patchs.value = value
  }
  function setWorkflowRunId(runId: string) {
    workflowRunId.value = runId
  }
  function getWorkflowRunId() {
    return workflowRunId.value
  }
  function removePatchingEvent() {
    patching = []
  }
  function getPatchingEvent() {
    return patching
  }
  function addPatchingEvent(fn = () => {}) {
    patching.push(fn)
  }

  return {
    // State
    session_id,
    messages,
    sessionList,
    patchs,
    workflowRunId,

    getSessionList,
    newSession,
    addMessage,

    getLastAssistantMessage,
    getAssistantIndex,
    localMessagePushChunk,
    createNewConversation,
    setSessionId,
    startAgentChat,
    stopAgentChat,
    setPatchs,
    setWorkflowRunId,
    getWorkflowRunId,
    addPatchingEvent,
    removePatchingEvent,
    getPatchingEvent,
  }
})
