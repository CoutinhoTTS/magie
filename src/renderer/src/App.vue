<script lang="ts" setup>
import { watchDebounced } from '@vueuse/core'
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'
import { onBeforeMount, onMounted, ref, useTemplateRef } from 'vue'
import Content from '@/layout/Content.vue'
import Header from '@/layout/Header.vue'
import LeftSide from '@/layout/LeftSide.vue'
import useSideSetting from '@/lib/useSideSetting'
import useWindowResize from '@/lib/useWindowResize'
import useProject from './lib/useProject'

const hasInit = ref(false)
onBeforeMount(async () => {
  useProject().getProjectList()
})
const side = useSideSetting()
useWindowResize(side.resize)
function handleResize(layout: number[]) {
  if (layout.length > 0) {
    side.setLeftWidth(Number.parseFloat(layout[0].toFixed(6)), true)
  }
}

const leftSideRef = useTemplateRef('leftSide_ref')
const contentRef = useTemplateRef('content_ref')

watchDebounced(() => side.leftSideWidthPercent, () => {
  leftSideRef.value?.resize(side.leftSideWidthPercent)
  contentRef.value?.resize(100 - side.leftSideWidthPercent)
}, { debounce: 200 })

onMounted(async () => {
  await side.init()
  hasInit.value = true
})
</script>

<template>
  <SplitterGroup
    v-if="hasInit"
    direction="horizontal"
    style="height: 100%"
    @layout="handleResize"
  >
    <SplitterPanel
      ref="leftSide_ref"
      :min-size="side.minLeftSideWidthPercent"
      :max-size="50"
      :default-size="side.leftSideWidthPercent"
      :collapsible="false"
    >
      <LeftSide />
    </SplitterPanel>
    <SplitterResizeHandle v-if="side.openLeftSide" class="w-2" />
    <SplitterPanel
      ref="content_ref"
      :min-size="20"
      :default-size="100 - side.leftSideWidthPercent"
      :collapsible="false"
    >
      <Content />
    </SplitterPanel>
  </SplitterGroup>
  <Header />
</template>
