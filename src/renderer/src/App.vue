<script lang="ts" setup>
import { Pane, Splitpanes } from 'splitpanes'
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import Content from '@/layout/Content.vue'
import Header from '@/layout/Header.vue'
import LeftSide from '@/layout/LeftSide.vue'
import useSideSetting from '@/lib/useSideSetting'
import useProject from './lib/useProject'
import 'splitpanes/dist/splitpanes.css'

const hasInit = ref(false)
onBeforeMount(async () => {
  useProject().getProjectList()
})
const side = useSideSetting()

function handleResize({ panes }) {
  if (Array.isArray(panes) && panes.length === 2)
    side.setLeftWidth(panes[0].size)
}
const second = computed(() => {
  if (side.openLeftSide) {
    return 100 - side.leftSideWidthPercent
  }
  return 100
})

onMounted(async () => {
  await side.init()
  hasInit.value = true
})
</script>

<template>
  <Splitpanes
    v-if="hasInit"
    style="height: 100%"
    @resize="handleResize"
  >
    <Pane
      v-if="side.openLeftSide"
      :min-size="side.minLeftSideWidthPercent"
      :max-size="50"
      :size="side.leftSideWidthPercent"
    >
      <LeftSide />
    </Pane>
    <Pane :size="second">
      <Content />
    </Pane>
  </Splitpanes>
  <Header />
</template>
