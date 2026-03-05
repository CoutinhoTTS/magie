<script setup lang="ts">
import type { MsgItem, StructuredContent } from './types'
import MarkdownRender, { MarkdownCodeBlockNode, setCustomComponents } from 'markstream-vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import 'markstream-vue/index.css'

defineProps<{
  messages?: MsgItem[]
  isStreaming?: boolean
}>()

// 判断是否为结构化内容
function isStructuredContent(content: string): boolean {
  try {
    const parsed = JSON.parse(content)
    return Array.isArray(parsed.chunks)
  }
  catch {
    return false
  }
}

// 解析结构化内容
function parseStructuredContent(content: string): StructuredContent {
  try {
    return JSON.parse(content)
  }
  catch {
    return { chunks: [] }
  }
}

setCustomComponents({ code_block: { ...MarkdownCodeBlockNode } })
</script>

<template>
  <ScrollArea class="w-full flex-1 magie-chat-list">
    <template v-for="value in (messages || [])" :key="value.id">
      <!-- User 消息 -->
      <div v-if="value.role === 'user'" class="w-full p-2 flex justify-end">
        <div class="max-w-[60%] rounded-2xl bg-gray-100 p-2">
          {{ value?.content }}
        </div>
      </div>

      <!-- Assistant 消息 -->
      <div v-if="value.role === 'assistant'" class="w-full p-2">
        <div class="w-full rounded-2xl">
          <!-- Error 类型 -->
          <div
            v-if="value?.type === 'error'"
            class="w-full bg-red-50 border border-red-400 rounded-2xl overflow-hidden p-2 text-red-500 text-sm"
          >
            {{ value?.content }}
          </div>

          <!-- 结构化 JSON 内容 -->
          <template v-else-if="value?.content && isStructuredContent(value.content)">
            <div v-for="chunk in parseStructuredContent(value.content).chunks" :key="chunk.payload.id">
              <!-- Reasoning -->
              <Accordion v-if="chunk.type === 'reasoning-delta'" type="single" collapsible class="w-full reasoning-block" default-value="item-1">
                <AccordionItem value="item-1" class="border-none">
                  <AccordionTrigger class="text-gray-500 text-xs hover:no-underline py-1">
                    <span class="flex items-center gap-1">
                      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      思考过程
                    </span>
                  </AccordionTrigger>
                  <AccordionContent class="pt-0 pb-1">
                    <div class="reasoning-content text-gray-500 text-xs italic border-l-2 border-gray-300 pl-2">
                      <MarkdownRender
                        :custom-id="chunk.payload.id"
                        :content="chunk.payload.text"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <!-- Text Delta - 用 MarkdownRender -->
              <MarkdownRender
                v-else-if="chunk.type === 'text-delta'"
                :custom-id="chunk.payload.id"
                :content="chunk.payload.text"
              />

              <!-- Tool Call (只显示调用信息) -->
              <div v-else-if="chunk.type === 'tool-call'" class="bg-blue-50 rounded p-2 mb-2 text-sm">
                <div class="font-medium">
                  🔧 {{ chunk.payload.toolName }}
                </div>
                <pre v-if="chunk.payload.args" class="text-xs mt-1 overflow-auto">{{ JSON.stringify(chunk.payload.args, null, 2) }}</pre>
              </div>

              <!-- Finish -->
              <div v-else-if="chunk.type === 'finish'" class="text-xs text-gray-400 mt-2">
                ✓ 完成
              </div>
            </div>
          </template>

          <!-- 纯文本内容 (向后兼容) -->
          <MarkdownRender
            v-else-if="value?.content"
            :custom-id="String(value.id!)"
            :content="value?.content"
          />
        </div>
      </div>
    </template>

    <!-- Streaming 指示器 -->
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

/* Reasoning 思考模式样式 */
.reasoning-block {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 0 0.5rem;
  margin-bottom: 0.5rem;
}

.reasoning-content :deep(p) {
  font-style: italic;
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.reasoning-content :deep(code) {
  font-style: italic;
  background-color: #e5e7eb;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
}
.reasoning-content :deep(.list-node){
  margin-top: 0;
  margin-bottom: 0;
}
</style>
