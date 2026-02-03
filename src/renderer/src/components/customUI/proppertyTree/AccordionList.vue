<script setup lang="ts">
import { computed } from 'vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import ChildrenEditor from './ChildrenEditor.vue'
import PropertyField from './PropertyField.vue'
import { createNestedPropModel, getItemLabel as getLabel } from './utils'

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
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const localValue = computed({
  get: () => props.modelValue || [],
  set: val => emit('update:modelValue', val),
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
</script>

<template>
  <div class="w-full">
    <template v-if="config.isField">
      <div v-if="localValue.length > 0">
        <Accordion type="single" collapsible class="w-full">
          <AccordionItem
            v-for="(item, index) in localValue"
            :key="index"
            :value="`item-${index}`"
            class="border rounded-md px-4"
          >
            <AccordionTrigger class="hover:no-underline">
              {{ getItemLabel(item, index) }}
            </AccordionTrigger>
            <AccordionContent>
              <div class="flex flex-col pt-4">
                <template v-for="child in config.children" :key="child.prop">
                  <ChildrenEditor
                    v-if="isArrayChildrenType(child)"
                    v-model="createPropModel(child, index).value"
                    :config="child"
                  />
                  <PropertyField
                    v-else
                    v-model="createPropModel(child, index).value"
                    :config="child"
                  />
                </template>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </template>
    <template v-else>
      <div v-if="localValue.length > 0">
        <Accordion type="single" collapsible class="w-full">
          <AccordionItem
            v-for="(item, index) in localValue"
            :key="index"
            :value="`item-${index}`"
            class="border rounded-md px-4"
          >
            <AccordionTrigger class="hover:no-underline">
              {{ getItemLabel(item, index) }}
            </AccordionTrigger>
            <AccordionContent>
              <div class="flex flex-col pt-4">
                <template v-for="child in config.children" :key="child.prop">
                  <ChildrenEditor
                    v-if="isArrayChildrenType(child)"
                    v-model="createPropModel(child, index).value"
                    :config="child"
                  />
                  <PropertyField
                    v-else
                    v-model="createPropModel(child, index).value"
                    :config="child"
                  />
                </template>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </template>
  </div>
</template>
