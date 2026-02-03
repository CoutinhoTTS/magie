<script setup lang="ts">
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Chat } from '@/components/customUI/chat'
import useSideSetting from '@/lib/useSideSetting'
import { PropertyPanel } from './property/index'

const route = useRoute()
const setting = useSideSetting()
const fullWidth = ref(0)
const content = useTemplateRef('content-full')

const rightPanelRef = useTemplateRef('rightPanel')
const chatPanelRef = useTemplateRef('chatPanel')
const defaultPanelRef = useTemplateRef('defaultPanel')
let isDragging = false

onMounted(() => {
  fullWidth.value = content.value?.clientWidth || 0
})

const rightPanelDefault = computed(() => {
  return setting.openRightSide ? setting.openRightSideWidthPercent : 0
})
const chatPanelDefault = computed(() => {
  return setting.openChatSide ? setting.openChatSideWidthPercent : 0
})

const firstPaneSize = computed(() => {
  let size = 100
  if (setting.openRightSide)
    size -= setting.openRightSideWidthPercent
  if (setting.openChatSide)
    size -= setting.openChatSideWidthPercent
  return size
})

function handleResize(layout: number[]) {
  if (!isDragging)
    return
  if (setting.openRightSide) {
    setting.setRightSize(layout[1])
  }
  if (setting.openChatSide) {
    const val = layout[layout.length - 1]
    setting.setChatSize(val)
  }
}
function dragging(dragging: boolean) {
  isDragging = dragging
}

watch([() => setting.openRightSide, () => setting.openChatSide], async ([value1, value2]) => {
  await nextTick()
  const targetSize1 = value1 ? setting.openRightSideWidthPercent : 0
  const targetSize2 = value2 ? setting.openChatSideWidthPercent : 0
  rightPanelRef.value?.resize(targetSize1)
  chatPanelRef.value?.resize(targetSize2)
  await nextTick()
  defaultPanelRef.value?.resize(firstPaneSize.value)
}, { flush: 'post' })

watch(() => route.name, (val) => {
  if (!['design'].includes(val as string)) {
    setting.switchRightSide(false)
  }
})
</script>

<template>
  <div
    ref="content-full" class="w-full h-full bg-white pt-8 rounded-2xl  overflow-hidden"
  >
    <SplitterGroup
      direction="horizontal"
      class="design-theme h-full"
      @layout="handleResize"
    >
      <SplitterPanel ref="defaultPanel" :order="0" :default-size="firstPaneSize">
        <div class="w-full h-full">
          <router-view />
        </div>
      </SplitterPanel>

      <template v-if="setting.openRightSide">
        <SplitterResizeHandle
          class="w-px bg-gray-200 "
          @dragging="dragging"
        />
        <SplitterPanel
          ref="rightPanel"
          :order="1"
          :default-size="rightPanelDefault"
          :min-size="setting.rightLimit"
        >
          <PropertyPanel />
        </SplitterPanel>
      </template>

      <template v-if="setting.openChatSide">
        <SplitterResizeHandle
          class="w-px bg-gray-200" @dragging="dragging"
        />
        <SplitterPanel
          ref="chatPanel"
          :order="2"
          :default-size="chatPanelDefault"
          :min-size="setting.rightLimit"
        >
          <Chat />
        </SplitterPanel>
      </template>
    </SplitterGroup>
  </div>
</template>

<style scoped>
:deep(.design-theme) {
  background: #ffffff;
}
</style>
