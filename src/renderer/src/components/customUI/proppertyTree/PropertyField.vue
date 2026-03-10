<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { Label } from '@/components/ui/label'
import { useChatStore } from '@/lib/useChatStore'

interface PropertyItem {
  label: string
  prop: string
  type?: string
  description?: string
  component?: any
  isField?: boolean
  defaultValue?: any
  children?: any[]
}

interface Props {
  config: PropertyItem
  modelValue: any
  pathMap?: string
  currentPath?: string
  arrayIndex?: number
  flexType?: 'row' | 'col'
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])
const chatStore = useChatStore()

const localValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  },
})
function setNewValue() {

}
const diffValue = computed(() => {
  const { patchs } = chatStore
  const currentPath = `props.${props.currentPath?.split(':')[1]}`
  const patch = patchs.find(item => item.prop === currentPath)

  return patch
})
</script>

<template>
  <div class="w-full flex flex-col gap-1 py-2 border-b last:border-b-0">
    <div
      class="w-full flex justify-between items-center" :class="{
        'flex-col': flexType === 'col',
        'gap-2': flexType === 'col',
        'bg-green-300': !!diffValue,
        'py-1': !!diffValue,
        'rounded-sm': !!diffValue,
      }"
    >
      <Label
        class="text-sm"
        :class="{
          'w-full': flexType === 'col',
        }"
      >{{ config.label }}</Label>
      <component
        :is="config.component"
        v-if="config.component"
        v-model="localValue"
        :disabled="!!diffValue"
        :class="{
          'w-full': flexType === 'col',
        }"
      />
    </div>
    <div v-if="!!diffValue" class="w-full flex justify-center items-center">
      <Icon icon="ep:arrow-up-bold" class="rotate-180 text-red-500" />
    </div>
    <div
      v-if="!!diffValue" class="w-full flex justify-between items-center" :class="{
        'flex-col': flexType === 'col',
        'gap-2': flexType === 'col',
        'bg-red-300': !!diffValue,
        'py-1': !!diffValue,
        'rounded-sm': !!diffValue,
      }"
    >
      <Label
        class="text-sm"
        :class="{
          'w-full': flexType === 'col',
        }"
      >{{ config.label }}</Label>
      <component
        :is="config.component"
        v-if="config.component"
        v-model="diffValue.newValue"
        disabled
        :class="{
          'w-full': flexType === 'col',
        }"
      />
    </div>
    <div v-if="config.description" class="text-xs text-gray-500">
      {{ config.description }}
    </div>
  </div>
</template>
