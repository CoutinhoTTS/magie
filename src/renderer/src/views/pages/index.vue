<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import { PageItem } from '@/components/customUI/pageItem/index'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { resizeObserver } from '@/lib/useObserver'
import usePages from '@/lib/usePages'

const usePagesPinia = usePages()
const content = useTemplateRef('pagesContent')
const pageItem = useTemplateRef('pageItems')
const pages = computed(() => {
  return (window as any).$utils.clone(usePagesPinia.pageList, true)
})
const itemHeight = ref(0)
const router = useRouter()

function resetAspectRatio() {
  if (Array.isArray(pageItem.value) && pageItem.value.length) {
    const width = pageItem.value[0].clientWidth
    itemHeight.value = width * (9 / 16)
  }
}

function editPage() {
  router.push({
    path: '/design',
  })
}

onMounted(() => {
  if (content.value)
    resizeObserver<HTMLDivElement>(content.value, resetAspectRatio)
})
</script>

<template>
  <div ref="pagesContent" class="w-full h-full overflow-hidden relative">
    <ScrollArea class="w-full h-full">
      <div class="grid gap-x-4 gap-y-4  auto-rows-max" style="grid-template-columns:repeat(auto-fit, minmax(250px, 1fr))">
        <div v-for="(value, index) in pages" ref="pageItems" :key="value.id" class="w-full rounded-b-sm relative group" :style="{ height: `${itemHeight}px` }">
          <PageItem :value />
          <div class=" absolute top-2 right-2 leading-4 text-sm opacity-50 flex justify-between items-center gap-0.5">
            <span class="cursor-pointer leading-1 p-0.5 group-hover:opacity-100 inline-block rounded-sm hover:bg-gray-200 transition-opacity duration-200 ease-in-out" @click.stop="editPage">
              <i class="icon-[mdi--settings-outline] opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out" />
            </span>
            <span class=" inline-block w-auto select-none">
              #{{ Number(index) + 1 }}
            </span>
          </div>
        </div>
      </div>
    </ScrollArea>
    <div class=" absolute bottom-0 right-0">
      <ul class=" border rounded-2xl overflow-hidden">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <li class="w-8 h-8 flex justify-center items-center cursor-pointer hover:bg-gray-200 transtion-background duration-200 ease-in-out" @click="editPage">
                <span class="icon-[mynaui--plus] font-bold text-xl" />
              </li>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ul>
    </div>
  </div>
</template>
