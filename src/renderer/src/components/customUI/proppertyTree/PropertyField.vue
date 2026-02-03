<script setup lang="ts">
import { computed } from 'vue'
import { Label } from '@/components/ui/label'

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

const localValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  },
})
</script>

<template>
  <div class="w-full flex flex-col gap-1 py-2 border-b last:border-b-0">
    <div
      class="w-full flex justify-between items-center" :class="{
        'flex-col': flexType === 'col',
        'gap-2': flexType === 'col',
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
