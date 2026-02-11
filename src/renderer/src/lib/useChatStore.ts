import type { MsgItem, MsgItemOption, SessionSummaryItem } from '~/types'
import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import useMoveable from './useMoveable'
import useProperty from './useProperty'

const invoke = window.api.invoke

export const useChatStore = defineStore('chat', () => {
  // State
  const session_id = ref<number | null>(null)
  const messages = ref<Array<MsgItem>>([])
  const sessionList = ref<Array<SessionSummaryItem>>([])

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

  function localMessagePushChunk(text: string, index: number) {
    messages.value[index].content += text
    messages.value[index].state = 'ing'
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
    const pageDesignData = JSON.parse(JSON.stringify(toRaw(moveable.pageDesignData)))
    const currentProperty = JSON.parse(JSON.stringify(toRaw(property.currentProperty)))

    invoke('agent_chat', {
      message,
      currentProperty,
      pageDesignData,
    })
  }
  function stopAgentChat() {
    invoke('agent_chat', false)
  }

  return {
    // State
    session_id,
    messages,
    sessionList,

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
  }
})
