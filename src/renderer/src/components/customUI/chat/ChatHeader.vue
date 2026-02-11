<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useChatStore } from '@/lib/useChatStore'

const emit = defineEmits<{
  newChat: []
  setSessionId: [val: number]
}>()

const chatStore = useChatStore()

const sessionId = computed({
  get: () => chatStore.session_id,
  set: (val) => {
    if (typeof val === 'number')
      emit('setSessionId', val)
  },
})
</script>

<template>
  <header class=" w-full p-2 bg-transparent absolute overflow-hidden z-9">
    <div class="flex justify-between items-center bg-gray-100 px-2 rounded-2xl shadow-2xs overflow-hidden">
      <div v-if="chatStore?.sessionList?.length" class="max-w-40">
        <Select v-model="sessionId">
          <SelectTrigger class="truncate border-0  outline-0 focus:ring-0 focus:outline-none shadow-none focus:shadow-none px-0">
            <SelectValue :placeholder="chatStore?.sessionList[0].description" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="value in chatStore?.sessionList" :key="value.session_id" :value="value.session_id!">
              {{ value.description || '' }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <TooltipProvider v-if="chatStore?.messages?.length && chatStore?.session_id" :delay-duration="800">
        <Tooltip>
          <TooltipTrigger as-child>
            <span class="inline-block p-1 rounded-sm hover:bg-gray-200 transition-bg duration-200 ease-in" @click="$emit('newChat')">
              <Icon
                icon="heroicons:plus-20-solid"
                class="h-4 w-4"
              />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>New Conversation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </header>
</template>
