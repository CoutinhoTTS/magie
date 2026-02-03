<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { onMounted, onUnmounted } from 'vue'
import components from '@/components/businessUI/index'
import { DesignTree } from '@/components/customUI/designTree/idnex'
import { ScrollArea } from '@/components/ui/scroll-area'
import useMoveable from '@/lib/useMoveable'
import { resizeObserver } from '@/lib/useObserver'
import useProperty from '@/lib/useProperty'
import useSideSetting from '@/lib/useSideSetting'

const moveable = useMoveable()
const property = useProperty()

const side = useSideSetting()

function checkOverflow(el: HTMLElement | null) {
  if (!el || !el.parentElement)
    return
  const parent = el.parentElement
  resizeObserver(parent, () => {
    const parentWidth = parent.clientWidth
    const elWidth = el.scrollWidth
    const elHeight = el.scrollHeight

    if (elWidth > parentWidth && 'style' in el) {
      const scale = parentWidth / elWidth
      el.style.transform = `scale(${scale})`
      el.style.transformOrigin = 'left top'
      parent.style.height = `${elHeight * scale}px`
    }
    else {
      el.style.transform = 'unset'
      parent.style.height = 'unset'
    }
  })
}
function containerEvent(e: Event) {
  const target = e.target as HTMLElement
  const container = target.closest('.container-can-push') as HTMLElement
  if (container) {
    property.undateStartDom(container)
  }
}

onMounted(() => {
  moveable.initMoveable()
  document.addEventListener('click', containerEvent)
})

onUnmounted(() => {
  document.removeEventListener('click', containerEvent)
})
</script>

<template>
  <div id="design" class=" w-full h-full flex justify-between items-center relative overflow-hidden">
    <div
      class="w-45 h-full py-2 flex flex-col justify-between items-center gap-2"
      :class="{
        'pl-2': !side.openLeftSide,
      }"
    >
      <div class=" w-full text-sm opacity-50">
        components
      </div>
      <div class="w-full flex-1 overflow-hidden ">
        <ScrollArea class="w-full h-full scroll-container" type="scroll">
          <div class="w-full flex flex-col justify-start items-center gap-2 components-group">
            <template v-for="item in components" :key="item.name">
              <div class=" w-full border p-1 rounded-sm flex flex-col justify-between items-start gap-1">
                <label class=" text-sm font-bold"> {{ item.name }}</label>
                <div
                  :id=" item.name " class=" relative w-full "
                  @mouseenter="moveable.mouseEnterTarget($event, item)"
                >
                  <component :is="item.component" :ref="(el: any) => checkOverflow(el?.$el || el)" class="component-item" />
                  <div class=" cover absolute inset-0 z-1 rounded-sm hover:bg-gray-200 opacity-40" />
                </div>
              </div>
            </template>
          </div>
        </ScrollArea>
      </div>
    </div>
    <div id="design-container" class="h-full flex-1 p-2 overflow-hidden relative group">
      <div id="design-board" class=" w-full h-full relative overflow-auto bg-gray-50 container-can-push" data-magie-node-id="root" data-magie-source-map="root.children:array:push:fn(*)">
        <DesignTree :nodes="moveable.pageDesignData.children" />
      </div>
      <div v-show="moveable.layerTop" id="design-board-top-layer" class=" absolute inset-2 z-999 bg-gray-950 opacity-50" />
      <!-- <div class=" absolute top-4 right-4 z-9999 box-border justify-center items-center cursor-pointer select-none gap-2 group-hover:flex hidden">
        <span class=" inline-block p-0.5 hover:bg-gray-200 rounded-sm box-border">
          <Icon class="size-5" icon="hugeicons:3-d-view" />
        </span>
        <span class=" inline-block p-0.5 hover:bg-gray-200 rounded-sm box-border">
          <Icon class="size-5" :icon="moveable.layerTop ? 'fluent:layer-24-filled' : 'fluent:layer-24-regular'" @click="moveable.switchLayer" />
        </span>
      </div> -->
    </div>
  </div>
</template>

<style>
.drop-target{
    border: 2px dashed bg-blue-400;
  }
</style>
