<script setup lang="tsx">
import { computed } from 'vue'
import components from '@/components/businessUI/index.tsx'
import useProperty from '@/lib/useProperty.ts'
import ChildrenEditor from './ChildrenEditor.vue'
import PropertyField from './PropertyField.vue'
import { getNestedValue, setNestedValue } from './utils'

interface PropertyItem {
  label: string
  prop: string
  type: string
  description?: string
  component?: any
  isTabs?: boolean
  isField?: boolean
  defaultValue?: any
  isTop?: boolean
  children?: any[]
}

defineProps({
  propertyConfig: Object as () => PropertyItem[] | undefined,
})

const property = useProperty()
const propertyConfig = computed(() => {
  const component = components.find(com => com.name === property?.currentProperty?.tagName)
  return component?.propertyConfig ?? []
})
const tagName = computed(() => property?.currentProperty?.tagName)

function initPath(prop: string) {
  return `${tagName.value ?? 'component'}:${prop}`
}

function createPropModel(prop: string, isTop?: boolean) {
  return computed({
    get: () => {
      if (isTop) {
        return getNestedValue(property?.currentProperty, prop)
      }
      return getNestedValue(property?.currentProperty?.props, prop)
    },
    set: (val) => {
      if (isTop) {
        setNestedValue(property.currentProperty, prop, val)
      }
      setNestedValue(property.currentProperty.props, prop, val)
    },
  })
}

function isArrayChildrenType(item: PropertyItem) {
  return item.type === 'array:children'
}
</script>

<template>
  <template v-for="item in propertyConfig" :key="item.prop">
    <ChildrenEditor
      v-if="isArrayChildrenType(item)"
      :config="item"
      :model-value="createPropModel(item.prop, ('isTop' in item) ? item.isTop : undefined).value"
      :path-map="initPath(item.prop)"
      :current-path="initPath(item.prop)"
      @update:model-value="(val: any) => createPropModel(item.prop, ('isTop' in item) ? item.isTop : undefined).value = val"
    />
    <PropertyField
      v-else
      :config="item"
      :model-value="createPropModel(item.prop, ('isTop' in item) ? item.isTop : undefined).value"
      :path-map="initPath(item.prop)"
      :current-path="initPath(item.prop)"
      @update:model-value="(val: any) => createPropModel(item.prop, ('isTop' in item) ? item.isTop : undefined).value = val"
    />
  </template>
</template>
