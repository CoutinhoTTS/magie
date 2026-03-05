<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Chat } from '@/components/customUI/chat'
import useSideSetting from '@/lib/useSideSetting'
import { PropertyPanel } from './property/index'
import 'splitpanes/dist/splitpanes.css'

const route = useRoute()
const setting = useSideSetting()

const firstChatPaneSize = computed(() => {
  if (setting.openChatSide)
    return 100 - setting.chatSideWidthPercent
  return 100
})

const firstRightPaneSize = computed(() => {
  if (setting.openRightSide)
    return 100 - setting.rightSideWidthPercent
  return 100
})

function handleResize({ panes, type}: { panes: Array<{ size: number }>, type: 'setRightSideWidth' | 'setChatSideWidth' }) {
  if (panes[panes.length - 1]) {
    setting[type](panes[panes.length - 1].size)
  }
}

watch(() => route.name, (val) => {
  if (!['design'].includes(val as string)) {
    setting.switchRightSide(false)
  }
})
</script>

<template>
  <div class="w-full h-full bg-white pt-8 rounded-2xl  overflow-hidden">
    <Splitpanes
      class="design-theme h-full"
      @resize="({ panes }) => {
        handleResize({
          panes,
          type: 'setChatSideWidth',
        })
      }"
    >
      <Pane :size="firstChatPaneSize">
        <Splitpanes
          @resize="({ panes }) => {
            handleResize({
              panes,
              type: 'setRightSideWidth',
            })
          }"
        >
          <Pane :size="firstRightPaneSize">
            <div class="w-full h-full">
              <router-view />
            </div>
          </Pane>
          <Pane
            v-if="setting.openRightSide"
            :size="setting.rightSideWidthPercent"
            :min-size="setting.minRightSideWidthPercent"
            :max-size="setting.maxRightPercent"
          >
            <PropertyPanel />
          </Pane>
        </Splitpanes>
      </Pane>
      <Pane
        v-if="setting.openChatSide"
        :size="setting.chatSideWidthPercent"
        :min-size="setting.minChatSideWidthPercent"
        :max-size="setting.maxChatPercent"
      >
        <Chat />
      </Pane>
    </Splitpanes>
  </div>
</template>

<style scoped>
:deep(.design-theme) {
  background: #ffffff;
}
</style>
