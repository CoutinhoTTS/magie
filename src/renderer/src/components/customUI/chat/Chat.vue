<script setup lang="tsx">
import type { IpcRenderer } from '@electron-toolkit/preload'
import type { ModelItem } from '~/types'
import { nextTick, onMounted, ref, watch } from 'vue'
import { useChatStore } from '@/lib/useChatStore'
import useModel from '@/lib/useModel'
import ChatHeader from './ChatHeader.vue'
import ChatInput from './ChatInput.vue'
import ChatMessageList from './ChatMessageList.vue'
import ChatSelect from './ChatSelect.vue'
import ModelSettings from './ModelSettings.vue'

const chatStore = useChatStore()
chatStore.getSessionList()

// 模型相关
const model = useModel()
const selectedModel = ref<ModelItem | null>(null)

// 流式状态
const isStreaming = ref(false)

// 选择弹窗可见性
const patchVisible = ref(false)

// IPC 渲染器实例
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

// 流式响应处理
async function streamingChunk(_, chunk) {
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
  if (item) {
    item.state = 'end'
    if (item.type !== 'error')
      chatStore.addMessage(item)
  }
}

function streamFull() { }

async function streamError(_, error) {
  isStreaming.value = false
  const assistantIndex = chatStore.getAssistantIndex({
    state: ['ing', 'no'],
  })
  if (chatStore.messages[assistantIndex]) {
    chatStore.messages[assistantIndex].type = 'error'
    chatStore.messages[assistantIndex].content = error
  }
  console.error('==========streamError==========')
  await nextTick()
  scrollToBottom()
}

async function streamAbort() {
  streamFinished()
}

// 工作流确认修改
async function workflowConfirmModify(_event: any, data: { runId: string, stepId: string, patch: any, summary: string }) {
  chatStore.setPatchs(data.patch)
  chatStore.setWorkflowRunId(data.runId)
  patchVisible.value = true
}

// 发送消息
async function handleSend(content: string) {
  let session_id = chatStore.session_id
  const message = content
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
  await nextTick()
  scrollToBottom()
  chatStore.startAgentChat(message)
}

// 停止聊天
function handleStop() {
  chatStore.stopAgentChat()
}

// 滚动到底部
function scrollToBottom() {
  const scrollAreaEl = document.querySelector('.magie-chat-list')
  const viewport = scrollAreaEl?.querySelector('[data-reka-scroll-area-viewport]')
  if (viewport) {
    viewport.scrollTop = viewport.scrollHeight
  }
}

// 新建会话
function addNewChat() {
  if (isStreaming.value)
    return
  chatStore.createNewConversation()
}

// 设置会话ID
function setSessionId(val: number) {
  chatStore.setSessionId(val)
}

// 添加模型
function addModel() {
  selectedModel.value = {
    api_key: '',
    url: '',
    name: '',
    selected: false,
    compatible_type: 'OpenAI',
  }
}

// 删除模型
function deleteModel() {
  // TODO: Implement delete model logic
}

// 关闭模型设置
function closeModelSeting() {
  model?.switchSetting()
}

// 监听模型变化，自动保存
watch(selectedModel, async (val) => {
  if (val) {
    const { api_key, url, name, compatible_type } = val
    if (api_key && url && name && compatible_type) {
      const { status, data } = await model.setModel(val)
      if (status && data?.id)
        selectedModel.value!.id = data?.id
    }
  }
}, { deep: true })
</script>

<template>
  <div class="w-full h-full overflow-hidden flex flex-col justify-between items-center relative text-sm">
    <ChatHeader v-if="!model.settingModel" @new-chat="addNewChat" @set-session-id="setSessionId" />
    <ChatMessageList
      :messages="chatStore.messages"
      :is-streaming="isStreaming"
    />

    <ChatInput
      :is-streaming="isStreaming"
      :model="model"
      @send="handleSend"
      @stop="handleStop"
    />

    <ModelSettings
      v-model="selectedModel"
      :visible="model.settingModel"
      :model-list="model?.modelLit || []"
      :form-config="model?.formConfig || []"
      @close="closeModelSeting"
      @add-model="addModel"
      @delete-model="deleteModel"
    />

    <ChatSelect v-if="patchVisible" @close="patchVisible = false" />
  </div>
</template>
