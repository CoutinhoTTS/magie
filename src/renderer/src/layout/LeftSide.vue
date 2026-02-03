<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { Search } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import useProject from '@/lib/useProject'
import useSideSetting from '@/lib/useSideSetting'
import Menu from './Menu/Menu.vue'

const projectPinia = useProject()
const searchResult = ref(void 0)
const setting = useSideSetting()
const style = computed(() => {
  return {
    minWidth: `${setting.defaultLeftSideWidth}px`,
  }
})

function addProject() {
  projectPinia.addProject()
}
</script>

<template>
  <div :style class="w-full h-full bg-gray-100 pt-10 flex flex-col justify-between items-center overflow-hidden border border-gray-50">
    <div class="px-2 w-full">
      <InputGroup class=" rounded-2xl h-8">
        <InputGroupInput v-model="searchResult" class=" border-0 shadow-none" placeholder="Search" />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
    </div>
    <div class="w-full h-full pt-40px flex-1 flex flex-col justify-start items-center">
      <div class="w-full px-2 pt-2 border-b flex justify-between items-center">
        <div class="text-xs opacity-50 font-bold">
          PROJECT GROUPS
        </div>
        <TooltipProvider :delay-duration="800">
          <Tooltip>
            <TooltipTrigger as-child>
              <span class=" inline-block p-1 rounded-sm hover:bg-gray-200 transition-bg duration-200 ease-in" @click="addProject">
                <Icon
                  icon="heroicons:plus-20-solid"
                  class="h-4 w-4"
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add project</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <ScrollArea class=" w-full h-full flex-1 ">
        <div class="p-2 w-full">
          <Menu />
        </div>
      </ScrollArea>
    </div>
    <div class="w-full h-8 px-2">
      底部
    </div>
  </div>
</template>
