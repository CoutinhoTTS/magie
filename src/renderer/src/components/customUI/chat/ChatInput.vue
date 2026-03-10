<script setup lang="tsx">
import type { ModelItem } from '~/types'
import { Icon } from '@iconify/vue'
import { computed, ref } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useProperty from '@/lib/useProperty'

const props = defineProps<{
  isStreaming?: boolean
  model: any
}>()

const emit = defineEmits<{
  'send': [content: string]
  'stop': []
}>()

const property = useProperty()

// 输入框内部状态
const inputContent = ref('')
const isEmpty = ref(true)

const placeholder = computed(() => isEmpty.value ? 'Chat' : void 0)

const currentModelId = computed({
  get: () => props.model?.currentModel?.id,
  set: (val) => {
    props.model?.setCurrentModel(val)
  },
})

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

  if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !props.isStreaming) {
    e.preventDefault()
    handleSend()
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

function isEditableEmpty(el: HTMLElement): boolean {
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

function handleSend() {
  const content = inputContent.value.trim()
  if (!content || props.isStreaming)
    return
  emit('send', content)
  clearInput()
}

function handleStop() {
  emit('stop')
}
</script>

<template>
  <div class="w-full box-border p-2">
    <div class="w-full h-max box-border border rounded-2xl bg-gray-100">
      <div
        id="magie-editor"
        class="editor w-full max-h-60 p-2 outline-none text-sm focus:ring-0 overflow-y-auto relative"
        contenteditable="true"
        :data-placeholder="placeholder"
        @input="inputing($event as InputEvent)"
        @paste="paste($event as ClipboardEvent)"
        @keydown="handleKeydown($event as KeyboardEvent)"
      />
      <div class="w-full flex justify-between items-center border-t px-2 select-none">
        <div class="flex justify-start items-center flex-1 overflow-hidden gap-2">
          <div class="flex justify-between items-center text-xs max-w-[50%] truncate cursor-pointer">
            <Icon icon="uil:link-broken" class="shrink-0" />
            <span v-if="property?.currentProperty?.tagName" class="truncate">
              {{ property?.currentProperty?.tagName }}
            </span>
          </div>
          <div class="flex justify-between items-center text-xs max-w-[50%] truncate cursor-pointer">
            <Icon icon="material-symbols:tag-rounded" class="shrink-0" />
            <Select v-if="model?.currentModel?.name" v-model="currentModelId">
              <SelectTrigger class="truncate border-0 h-max outline-0 focus:ring-0 focus:outline-none shadow-none focus:shadow-none px-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="value in model?.modelLit?.filter((v: ModelItem) => v?.id) || []" :key="value.id!" :value="value.id!">
                  {{ value.name || '' }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="flex justify-end-safe items-center text-2xl cursor-pointer" @click="!isStreaming && handleSend()">
          <Icon v-if="!isStreaming" icon="lets-icons:send-hor" />
          <Icon v-else icon="fa6-regular:circle-stop" @click.stop="handleStop()" />
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

:deep(input.h-9) {
  height: calc(var(--spacing) * 7);
}
</style>
