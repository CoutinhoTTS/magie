import type { IpcRenderer } from '@electron-toolkit/preload'
import type { ComputedRef } from 'vue'
import type { ModelItem } from '~/types'
import { watchDebounced } from '@vueuse/core'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useChatStore } from '@/lib/useChatStore'
import useModel from '@/lib/useModel'

export interface UseChatReturn {
  // 状态
  inputContent: ReturnType<typeof ref<string>>
  isEmpty: ReturnType<typeof ref<boolean>>
  selectedModel: ReturnType<typeof ref<null | ModelItem>>
  isStreaming: ReturnType<typeof ref<boolean>>
  currentModelId: Readonly<ComputedRef<number | undefined>>
  placeholder: ComputedRef<string | undefined>
  model: ReturnType<typeof useModel>

  // 方法
  send: () => Promise<void>
  stopChat: () => void
  scrollToBottom: () => void
  clearInput: () => void
  inputing: (e?: InputEvent) => void
  paste: (e: ClipboardEvent) => void
  handleKeydown: (e: KeyboardEvent) => void
  selectedModelFn: (value?: ModelItem) => void
  addModel: () => void
  deleteModel: () => void
  addNewChat: () => void
  closeModelSeting: () => void
  isEditableEmpty: (el: HTMLElement) => boolean
  setSessionId: (val: number) => void
}

export function useChat(): UseChatReturn {
  const inputContent = ref('')
  const isEmpty = ref(true)
  const model = useModel()
  const selectedModel = ref<null | ModelItem>(null)
  const isStreaming = ref(false)

  const chatStore = useChatStore()

  const currentModelId = computed({
    get: () => model?.currentModel?.id,
    set: (val) => {
      model?.setCurrentModel(val)
    },
  })

  let ipcRenderer: IpcRenderer | null = null
  onMounted(() => {
    ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.on('llm:streaming', streamingChunk)
    ipcRenderer.on('llm:finished', streamFinished)
    ipcRenderer.on('llm:full', streamFull)
    ipcRenderer.on('llm:error', streamError)
    ipcRenderer.on('llm:abort', streamAbort)
    ipcRenderer.on('workflow:confirm_modify', workflowConfirmModify)
  })

  async function workflowConfirmModify(_event: any, data: { runId: string, stepId: string, patch: any, summary: string }) {
    // 测试：直接确认并恢复工作流
    const invoke = window.api.invoke
    // const result =
    await invoke('workflow:resume', {
      runId: data.runId,
      resumeData: { confirmed: true },
    })
  }

  const placeholder = computed(() => isEmpty.value ? 'Chat' : void 0)

  function inputing(e?: InputEvent) {
    const el = (e?.target ?? document.querySelector('#magie-editor[contenteditable="true"]')) as HTMLElement
    if (!el)
      return
    isEmpty.value = isEditableEmpty(el)
    inputContent.value = el.innerText
  }

  function paste(e: ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData?.getData('text/plain') ?? ''
    const html = text.replace(/\n/g, '<br>')

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0)
      return

    const range = selection.getRangeAt(0)
    range.deleteContents()

    const fragment = range.createContextualFragment(html)
    const lastNode = fragment.lastChild
    range.insertNode(fragment)

    if (lastNode) {
      range.setStartAfter(lastNode)
      range.setEndAfter(lastNode)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    inputing()
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const br = document.createElement('br')
        range.insertNode(br)
        range.setStartAfter(br)
        range.setEndAfter(br)
        selection.removeAllRanges()
        selection.addRange(range)
      }
      return
    }

    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !isStreaming.value) {
      e.preventDefault()
      send()
    }
  }

  function clearInput() {
    inputContent.value = ''
    isEmpty.value = true
    const el = document.querySelector('#magie-editor[contenteditable="true"]') as HTMLElement
    if (el) {
      el.innerHTML = ''
    }
  }

  async function send() {
    let session_id = chatStore.session_id
    const message = inputContent.value
    if (!message.trim() || isStreaming.value)
      return

    if (!session_id) {
      await chatStore.newSession(message)
      session_id = chatStore.session_id
    }
    if (!session_id)
      return
    await chatStore.addMessage({ role: 'user', content: message, type: 'normal', state: 'end' })
    await chatStore.addMessage({ role: 'assistant', content: '', type: 'normal', state: 'no' })
    isStreaming.value = true
    clearInput()
    await nextTick()
    scrollToBottom()
    chatStore.startAgentChat(message)
  }

  function stopChat() {
    chatStore.stopAgentChat()
  }

  function scrollToBottom() {
    const scrollAreaEl = document.querySelector('.magie-chat-list')
    const viewport = scrollAreaEl?.querySelector('[data-reka-scroll-area-viewport]')
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight
    }
  }

  async function streamingChunk(_, chunk) {
    // const { payload: { text } } = chunk
    const assistantIndex = chatStore.getAssistantIndex({
      state: ['ing', 'no'],
    })

    chatStore.localMessagePushChunk(chunk, assistantIndex)

    await nextTick()

    scrollToBottom()
  }

  function streamFinished() {
    const assistantIndex = chatStore.getAssistantIndex({
      state: ['ing', 'no'],
    })
    isStreaming.value = false
    const item = chatStore.messages[assistantIndex]
    item.state = 'end'
    if (item.type !== 'error')
      chatStore.addMessage(item)
  }

  function streamFull() { }
  async function streamError(_, error) {
    isStreaming.value = false
    const assistantIndex = chatStore.getAssistantIndex({
      state: ['ing', 'no'],
    })
    chatStore.messages[assistantIndex].type = 'error'
    chatStore.messages[assistantIndex].content = error
    console.error('==========streamError==========')
    await nextTick()
    scrollToBottom()
  }

  async function streamAbort() {
    streamFinished()
  }

  function selectedModelFn(value?: ModelItem) {
    if (value) {
      selectedModel.value = value
    }
  }

  function addModel() {
    selectedModel.value = {
      api_key: '',
      url: '',
      name: '',
      selected: false,
      compatible_type: 'OpenAI',
    }
  }

  function deleteModel() {
    // TODO: Implement delete model logic
  }

  function addNewChat() {
    if (isStreaming.value)
      return
    chatStore.createNewConversation()
  }

  function closeModelSeting() {
    model?.switchSetting()
  }

  function isEditableEmpty(el: HTMLElement) {
    const childNodes = el?.childNodes || []
    if (!childNodes.length)
      return true
    if (childNodes.length === 1) {
      if (childNodes[0].nodeName === 'BR')
        return true
      if (childNodes[0].nodeName === 'DIV') {
        return isEditableEmpty(childNodes[0] as HTMLElement)
      }
    }
    return false
  }

  function setSessionId(val) {
    chatStore.setSessionId(val)
  }

  watchDebounced(() => selectedModel.value, async (val) => {
    if (val) {
      const { api_key, url, name, compatible_type } = val
      if (api_key && url && name && compatible_type) {
        const { status, data } = await model.setModel(val)
        if (status && data?.id)
          selectedModel.value!.id = data?.id
      }
    }
  }, {
    debounce: 200,
    deep: true,
  })

  return {
    // 状态
    inputContent,
    isEmpty,
    selectedModel,
    isStreaming,
    currentModelId,
    placeholder,
    model,

    // 方法
    send,
    stopChat,
    scrollToBottom,
    clearInput,
    inputing,
    paste,
    handleKeydown,
    selectedModelFn,
    addModel,
    deleteModel,
    addNewChat,
    closeModelSeting,
    isEditableEmpty,
    setSessionId,
  }
}
