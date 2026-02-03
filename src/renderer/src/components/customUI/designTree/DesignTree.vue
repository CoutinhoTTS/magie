<script setup lang="ts">
import type { PageNode } from '~/types'
import { computed } from 'vue'

interface Props {
  nodes?: PageNode[]
}

const props = withDefaults(defineProps<Props>(), {
  nodes: () => [],
})

const renderNodes = computed(() => {
  return props.nodes
})
</script>

<template>
  <template v-for="comp in renderNodes">
    <div v-if="comp?.id" :id="comp.tagId" :key="comp?.id" :data-magie-node-id="comp.id" class=" relative border border-dashed render-node" :class="comp?.props?.hFull ? 'h-full' : ''">
      <component
        :is="comp.tagName"
        v-bind="{ ...comp.props }"
        :style="comp.styles"
      >
        <DesignTree v-if="comp.children && comp.children.length > 0" :nodes="comp.children" />
      </component>
    </div>
  </template>
</template>
