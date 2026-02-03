<script setup lang="ts">
import { computed } from 'vue'
import AccordionTabs from './AccordionTabs.vue'
import PropertyField from './PropertyField.vue'

interface PropertyItem {
  label: string
  prop: string
  type: string
  description?: string
  component?: any
  isTabs?: boolean
  isField?: boolean
  defaultValue?: any
  children?: any[]
}

interface Props {
  config: PropertyItem
  modelValue: any[]
  pathMap?: string
  currentPath?: string
  arrayIndex?: number
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const localValue = computed({
  get: () => props.modelValue || [],
  set: val => emit('update:modelValue', val),
})
</script>

<template>
  <AccordionTabs
    v-if="config.isTabs"
    :config="config"
    :model-value="localValue"
    :path-map="pathMap"
    :current-path="currentPath"
    @update:model-value="$emit('update:modelValue', $event)"
  />
  <PropertyField
    v-else
    :config="config"
    :model-value="localValue"
    :path-map="pathMap"
    :current-path="currentPath"
    :array-index="arrayIndex"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
