<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import components from '@/components/businessUI/index'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ChildrenEditor from './ChildrenEditor.vue'
import PropertyField from './PropertyField.vue'
import { createNestedPropModel, getItemLabel as getLabel, getNestedValue } from './utils'

interface PropertyItem {
  label: string
  prop: string
  type: string
  description?: string
  component?: any
  defaultValue?: any
  isField?: boolean
  children?: any[]
}

interface Props {
  config: PropertyItem
  modelValue: any[]
  pathMap?: string
  currentPath?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const localValue = computed({
  get: () => props.modelValue || [],
  set: val => emit('update:modelValue', val),
})

const activeTab = computed(() => {
  return localValue.value.length > 0 ? `item-${0}` : ''
})

// 创建 prop model 的辅助函数
function createPropModel(child: any, index: number) {
  return createNestedPropModel(localValue, child, index, emit)
}

function isArrayChildrenType(child: any) {
  return child.type === 'array:children'
}

function getItemLabel(item: any, index: number) {
  const labelItem = props.config.children?.find((child: PropertyItem) => child.prop === 'label')
  return getLabel(item, labelItem?.prop, `${props.config.label} ${index + 1}`)
}

function getPathMap(basePath: string, childProp: string) {
  return `${basePath}[number].${childProp}`
}

function getCurrentPath(basePath: string, itemIndex: number, childProp: string) {
  return `${basePath}[${itemIndex}].${childProp}`
}

function addTab() {
  const { pathMap } = props
  if (!pathMap)
    return
  const [componentName, path] = pathMap.split(':')
  if (!componentName || !path)
    return
  const component = components.find(com => com.name === componentName)
  if (!component?.defaultProps)
    return

  const actualPath = path.replace(/\[number\]/g, '[0]')
  let defaultItem = getNestedValue(component.defaultProps, actualPath)
  if (!defaultItem || (Array.isArray(defaultItem) && !defaultItem.length))
    return
  if (Array.isArray(defaultItem)) {
    defaultItem = defaultItem[0]
  }
  const newItem = (window as any).$utils.clone(defaultItem, true)
  const newValue = [...localValue.value, newItem]
  emit('update:modelValue', newValue)
}
</script>

<template>
  <div class="w-full">
    <template v-if="config.isField">
      <PropertyField
        :config="config"
        :model-value="localValue"
        :path-map="pathMap"
        :current-path="currentPath"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </template>
    <template v-else>
      <Accordion type="single" default-value="tabs" collapsible class="w-full border-b last:border-b-0">
        <AccordionItem value="tabs" class="border-b-0">
          <AccordionTrigger class="hover:no-underline">
            {{ config.label }}
          </AccordionTrigger>
          <AccordionContent>
            <div v-if="localValue.length > 0">
              <Tabs :default-value="activeTab" class="w-full">
                <TabsList class="w-full justify-start bg-gray-200">
                  <TabsTrigger
                    v-for="(_, index) in localValue"
                    :key="index"
                    :value="`item-${index}`"
                  >
                    {{ getItemLabel(localValue[index], index) }}
                  </TabsTrigger>
                  <span class="ml-auto text-[1.2rem] cursor-pointer" @click.stop="addTab">
                    <Icon icon="ph:plus-circle" />
                  </span>
                </TabsList>
                <TabsContent
                  v-for="(_, index) in localValue"
                  :key="index"
                  :value="`item-${index}`"
                  class="mt-4"
                >
                  <div class="flex flex-col">
                    <template v-for="child in config.children" :key="child.prop">
                      <ChildrenEditor
                        v-if="isArrayChildrenType(child)"
                        v-model="createPropModel(child, index).value"
                        :config="child"
                        :path-map="getPathMap(currentPath || pathMap || config.prop, child.prop)"
                        :current-path="getCurrentPath(currentPath || pathMap || config.prop, index, child.prop)"
                        :array-index="index"
                      />
                      <PropertyField
                        v-else
                        v-model="createPropModel(child, index).value"
                        :config="child"
                        :path-map="getPathMap(currentPath || pathMap || config.prop, child.prop)"
                        :current-path="getCurrentPath(currentPath || pathMap || config.prop, index, child.prop)"
                        :array-index="index"
                      />
                    </template>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </template>
  </div>
</template>
