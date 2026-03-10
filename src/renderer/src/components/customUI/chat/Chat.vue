<script setup lang="tsx">
import { useChatStore } from '@/lib/useChatStore'
import ChatHeader from './ChatHeader.vue'
import ChatInput from './ChatInput.vue'
import ChatMessageList from './ChatMessageList.vue'
import ChatSelect from './ChatSelect.vue'
import { useChat } from './composables/useChat'
import ModelSettings from './ModelSettings.vue'

const chatStore = useChatStore()
chatStore.getSessionList()
const {
  isStreaming,
  inputContent,
  isEmpty,
  model,
  selectedModel,
  send,
  stopChat,
  inputing,
  paste,
  handleKeydown,
  selectedModelFn,
  addModel,
  deleteModel,
  addNewChat,
  closeModelSeting,
  setSessionId,
  patchVisible,
} = useChat()

function handleSend() {
  send()
}

function handleStop() {
  stopChat()
}
</script>

<template>
  <div class="w-full h-full overflow-hidden flex flex-col justify-between items-center relative text-sm">
    <ChatHeader v-if="!model.settingModel" @new-chat="addNewChat" @set-session-id="setSessionId" />
    <ChatMessageList
      :messages="chatStore.messages"
      :is-streaming="isStreaming"
    />

    <ChatInput
      :input-content="inputContent"
      :is-empty="isEmpty"
      :is-streaming="isStreaming"
      :model="model"
      @update:input-content="inputContent = $event"
      @send="handleSend"
      @stop="handleStop"
      @inputing="inputing"
      @paste="paste"
      @keydown="handleKeydown"
    />

    <ModelSettings
      :visible="model.settingModel"
      :model-list="model?.modelLit || []"
      :selected-model="selectedModel"
      :form-config="model?.formConfig || []"
      @update-selected-model="selectedModelFn"
      @close="closeModelSeting"
      @add-model="addModel"
      @delete-model="deleteModel"
    />
    {{ patchVisible }}
    <ChatSelect v-if="patchVisible" />
  </div>
</template>
