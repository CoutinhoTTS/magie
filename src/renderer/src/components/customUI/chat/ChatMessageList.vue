<script setup lang="ts">
import type { MsgItem } from './types'
import MarkdownRender, { MarkdownCodeBlockNode, setCustomComponents } from 'markstream-vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import 'markstream-vue/index.css'

defineProps<{
  messages?: MsgItem[]
  isStreaming?: boolean
}>()

setCustomComponents({ code_block: { ...MarkdownCodeBlockNode } })
</script>

<template>
  <ScrollArea class="w-full flex-1 magie-chat-list">
    <template v-for="value in (messages || [])" :key="value.id">
      <div v-if="value.role === 'user'" class="w-full p-2 flex justify-end">
        <div class="max-w-[60%] rounded-2xl bg-gray-100 p-2">
          {{ value?.content }}
        </div>
      </div>
      <div v-if="value.role === 'assistant'" class="w-full p-2">
        <div class="w-full rounded-2xl">
          <MarkdownRender v-if="value?.content && value?.type !== 'error'" :custom-id="String(value.id!)" :content="value?.content" />
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
</template>

<style scoped>
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

.magie-chat-list :deep(div[data-reka-scroll-area-viewport]>div) {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-top: 50px;
}
</style>
