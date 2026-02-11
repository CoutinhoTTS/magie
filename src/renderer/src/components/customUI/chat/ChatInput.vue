<script setup lang="tsx">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useProperty from '@/lib/useProperty'

const props = defineProps<{
  inputContent?: string
  isEmpty?: boolean
  isStreaming?: boolean
  model: any
}>()

const emit = defineEmits<{
  'update:inputContent': [value: string]
  'send': []
  'stop': []
  'inputing': [e?: InputEvent]
  'paste': [e: ClipboardEvent]
  'keydown': [e: KeyboardEvent]
}>()

const property = useProperty()

const placeholder = computed(() => props.isEmpty ? 'Chat' : void 0)

const currentModelId = computed({
  get: () => props.model?.currentModel?.id,
  set: (val) => {
    props.model?.setCurrentModel(val)
  },
})
</script>

<template>
  <div class="w-full box-border p-2">
    <div class="w-full h-max box-border border rounded-2xl bg-gray-100">
      <div
        id="magie-editor"
        class="editor w-full max-h-60 p-2 outline-none text-sm focus:ring-0 overflow-y-auto relative"
        contenteditable="true"
        :data-placeholder="placeholder"
        @input="emit('inputing', $event)"
        @paste="emit('paste', $event)"
        @keydown="emit('keydown', $event)"
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
                <SelectItem v-for="value in model?.modelLit?.filter(v => v?.id) || []" :key="value.id!" :value="value.id!">
                  {{ value.name || '' }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="flex justify-end-safe items-center text-2xl cursor-pointer" @click="!isStreaming && emit('send')">
          <Icon v-if="!isStreaming" icon="lets-icons:send-hor" />
          <Icon v-else icon="fa6-regular:circle-stop" @click.stop="emit('stop')" />
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
