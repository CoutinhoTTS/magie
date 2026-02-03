<script setup lang="tsx">
import type { IpcRenderer } from '@electron-toolkit/preload'
import type { ModelItem } from '~/types'
import { Icon } from '@iconify/vue'
import { watchDebounced } from '@vueuse/core'
import MarkdownRender from 'markstream-vue'
import { computed, nextTick, onMounted, ref } from 'vue'
import PropertyField from '@/components/customUI/proppertyTree/PropertyField.vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useModel from '@/lib/useModel'
import useProperty from '@/lib/useProperty'
import 'markstream-vue/index.css'

interface MsgItem { id: string, role: string, content: string, type: 'normal' | 'error', state?: 'no' | 'ing' | 'end' }

const property = useProperty()
const inputContent = ref('')
const isEmpty = ref(true)
const model = useModel()
const selectedModel = ref<null | ModelItem>(null)
const messages = ref<Array<MsgItem>>([])
const isStreaming = ref(false)
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
  ipcRenderer.on('llm:error', streamError)
  ipcRenderer.on('llm:abort', streamAbort)
})

function generateId() {
  return (window as any)?.$utils?.guid()
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
  const invoke = window.api.invoke
  const message = inputContent.value
  if (!message.trim() || isStreaming.value)
    return
  messages.value.push({ id: generateId(), role: 'user', content: message, type: 'normal' })
  messages.value.push({ id: generateId(), role: 'assistant', content: '', type: 'normal', state: 'no' })
  isStreaming.value = true
  clearInput()
  await nextTick()
  scrollToBottom()
  invoke('agent_chat', message)
}

type MsgItemOption = {
  [K in keyof Omit<MsgItem, 'role'>]?: MsgItem[K] | MsgItem[K][]
}

function stopChat() {
  const invoke = window.api.invoke
  invoke('agent_chat', false)
}

function getAssistantIndex(option?: MsgItemOption): number
function getAssistantIndex(option: Record<string, any>): number
function getAssistantIndex(option: any = {}) {
  return messages.value.findLastIndex((msg) => {
    return Object.entries(option).every(([key, value]) => {
      if (Array.isArray(value)) {
        return value.includes(msg[key as keyof MsgItem])
      }
      return msg[key as keyof MsgItem] === value
    })
    && msg.role === 'assistant'
  })
}

function scrollToBottom() {
  const scrollAreaEl = document.querySelector('.magie-chat-list')
  const viewport = scrollAreaEl?.querySelector('[data-reka-scroll-area-viewport]')
  if (viewport) {
    viewport.scrollTop = viewport.scrollHeight
  }
}

async function streamingChunk(_, chunk) {
  const assistantIndex = getAssistantIndex({
    state: ['ing', 'no'],
  })
  messages.value[assistantIndex].content += chunk
  messages.value[assistantIndex].state = 'ing'
  await nextTick()
  scrollToBottom()
}
function streamFinished() {
  const assistantIndex = getAssistantIndex({
    state: ['ing', 'no'],
  })
  messages.value[assistantIndex].state = 'end'
  isStreaming.value = false
}

async function streamError(_, error) {
  isStreaming.value = false
  const assistantIndex = getAssistantIndex({
    state: ['ing', 'no'],
  })
  messages.value[assistantIndex].state = 'end'
  messages.value[assistantIndex].type = 'error'
  messages.value[assistantIndex].content = error
  console.error('==========streamError==========')
  await nextTick()
  scrollToBottom()
}

async function streamAbort() {
  isStreaming.value = false
  const assistantIndex = getAssistantIndex({
    state: ['ing', 'no'],
  })
  messages.value[assistantIndex].state = 'end'
  await nextTick()
  scrollToBottom()
}
function selectedModelFn(value: ModelItem | null) {
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
</script>

<template>
  <div class=" w-full h-full overflow-hidden flex flex-col justify-between items-center relative">
    <ScrollArea class="w-full flex-1 magie-chat-list">
      <template v-for="value in messages" :key="value.id">
        <div v-if="value.role === 'user'" class="w-full p-2 flex justify-end">
          <div class="max-w-[60%] rounded-2xl bg-gray-100 p-2">
            {{ value?.content }}
          </div>
        </div>
        <div v-if="value.role === 'assistant'" class="w-full p-2">
          <div
            class=" w-full rounded-2xl"
          >
            <MarkdownRender v-if="value?.content && value?.type !== 'error'" :custom-id="value.id" :content="value?.content" />
            <div
              v-if="value?.content && value?.type === 'error'"
              class="w-full bg-red-50 border border-red-400 rounded-2xl overflow-hidden p-2 text-red-500 text-sm break-all"
            >
              {{ value?.content }}
            </div>
          </div>
        </div>
      </template>
      <div class="w-full px-2">
        <div v-if="isStreaming" class="flex items-center gap-1 py-2">
          <span class="w-2 h-2 bg-black rounded-full loading-dot" />
        </div>
      </div>
    </ScrollArea>
    <div class=" w-full box-border  p-2">
      <div class=" w-full h-max box-border border rounded-2xl bg-gray-100">
        <div
          id="magie-editor"
          class="editor w-full max-h-60 p-2 outline-none text-sm focus:ring-0 overflow-y-auto relative "
          contenteditable="true"
          :data-placeholder="placeholder"
          @input="inputing"
          @paste="paste"
          @keydown="handleKeydown"
        />
        <div class=" w-full flex justify-between items-center border-t px-2 select-none">
          <div class=" flex justify-start items-center flex-1 overflow-hidden gap-2">
            <div class=" flex justify-between items-center text-xs max-w-[50%] truncate cursor-pointer ">
              <Icon icon="uil:link-broken" class="shrink-0" />
              <span v-if="property?.currentProperty?.tagName" class="truncate">
                {{ property?.currentProperty?.tagName }}
              </span>
            </div>
            <div class=" flex justify-between items-center text-xs max-w-[50%] truncate cursor-pointer">
              <Icon icon="material-symbols:tag-rounded" class="shrink-0" />
              <Select v-if="model?.currentModel?.name" v-model="currentModelId">
                <SelectTrigger class="truncate border-0 h-max outline-0 focus:ring-0 focus:outline-none shadow-none focus:shadow-none px-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="value in model?.modelLit?.filter(v => v?.id) || []" :key="value.id!" :value="value.id!">
                    {{ value.name || '' }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class=" flex justify-end-safe items-center text-2xl cursor-pointer ">
            <Icon v-if="!isStreaming" icon="lets-icons:send-hor" />
            <Icon v-else icon="fa6-regular:circle-stop" @click.stop="stopChat" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="model.settingModel" class=" absolute inset-0 bg-white flex flex-col justify-between items-center">
      <div class=" w-full text-ml font-bold p-2 box-border border-b flex justify-between items-center select-none">
        <span>
          模型设置
        </span>
        <i class=" cursor-pointer" @click.stop="closeModelSeting">
          <Icon icon="material-symbols:close-rounded" />
        </i>
      </div>
      <div class=" w-full flex-1 overflow-y-auto p-2">
        <div class=" w-full max-h-80 overflow-y-auto bg-gray-100 rounded-2xl  flex flex-col justify-between items-center">
          <ul v-if="model?.modelLit?.length" class=" w-full  overflow-y-auto p-2 flex flex-col justify-start items-center gap-2 text-ml">
            <li
              v-for="value in model?.modelLit" :key="value.id!" class="py-px px-2 rounded-sm cursor-pointer select-none w-full flex justify-between items-center hover:bg-gray-200"
              :class="{
                'bg-gray-200': selectedModel && selectedModel?.id === value?.id,
              }"
              @click="selectedModelFn(value) "
            >
              <span>
                {{ value.name }}
              </span>
              <i class=" text-gray-400 hover:text-gray-600" @click.stop="deleteModel">
                <Icon icon="fluent:delete-20-filled" />
              </i>
            </li>
            <li
              v-if="selectedModel && !selectedModel.id" class=" bg-gray-200 py-px px-2 rounded-sm cursor-pointer select-none w-full" :class="{
                ' text-gray-400': !selectedModel.name,
              }"
            >
              {{ selectedModel.name || 'Inputting...' }}
            </li>
          </ul>
          <div v-else class="w-full h-20 flex justify-center items-center">
            暂无模型
          </div>
          <div class=" border-t w-full flex justify-start items-center gap-2 px-2 py-1 cursor-pointer">
            <Icon icon="mynaui:plus" @click="addModel" />
            <Icon icon="mynaui:minus" />
          </div>
        </div>
        <div v-if="selectedModel" class="w-full bg-gray-100 rounded-2xl flex flex-col justify-start items-center p-2 mt-2">
          <PropertyField v-for="item in model?.formConfig" :key="item?.prop" v-model="selectedModel[item?.prop]" flex-type="col" :config="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor[data-placeholder]::before {
  content: attr(data-placeholder);
  color: #9ca3af;
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 0;
  box-sizing: border-box;
  padding: 0.5rem 0.6rem;
}

:deep(input.h-9){
    height: calc(var(--spacing) * 7);
  }

@keyframes breathe-scale {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(2.5);
    opacity: 0.3;
  }
}

.loading-dot {
  animation: breathe-scale 1.5s ease-in-out infinite;
}

.magie-chat-list :deep(div[data-reka-scroll-area-viewport]) {
  min-height: 100%;
}
.magie-chat-list :deep(div[data-reka-scroll-area-viewport]>div){
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}
</style>
