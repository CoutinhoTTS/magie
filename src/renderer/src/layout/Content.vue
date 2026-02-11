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

const firstPaneSize = computed(() => {
  return (keyName: 'openChatSide' | 'openRightSide') => {
    if (setting[keyName])
      return 100 - setting[`${keyName}WidthPercent`]
    return 100
  }
})

function handleResize({ panes, type}: { panes: Array<{ size: number }>, type: 'setRightSize' | 'setChatSize' }) {
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
          type: 'setChatSize',
        })
      }"
    >
      <Pane :size="firstPaneSize('openChatSide')">
        <Splitpanes
          @resize="({ panes }) => {
            handleResize({
              panes,
              type: 'setRightSize',
            })
          }"
        >
          <Pane :size="firstPaneSize('openRightSide')">
            <div class="w-full h-full">
              <router-view />
            </div>
          </Pane>
          <Pane
            v-if="setting.openRightSide"
            :size="setting.openRightSideWidthPercent"
            :min-size="setting.rightLimit"
            :max-size="setting.maxRightPercent"
          >
            <PropertyPanel />
          </Pane>
        </Splitpanes>
      </Pane>
      <Pane
        v-if="setting.openChatSide"
        :size="setting.openChatSideWidthPercent"
        :min-size="setting.rightLimit"
        :max-size="setting.maxChatPercent"
      >
        {{ setting.openChatSideWidthPercent }}
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
