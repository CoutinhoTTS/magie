<script setup lang="ts">
import type { TreeItemToggleEvent } from 'reka-ui'
import type { ProjectNode, ResultType } from '~/types'
import { Icon } from '@iconify/vue'
import { TreeItem, TreeRoot } from 'reka-ui'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import useProject from '@/lib/useProject'

const invoke = window.api.invoke

const projectPinia = useProject()
const router = useRouter()
const route = useRoute()
const currentMenu = ref<ProjectNode>()
const dbMenu = ref<ProjectNode>()
const dbMenuTitle = computed<string>({
  get() {
    return dbMenu.value?.name ?? ''
  },
  set(value) {
    if (dbMenu.value) {
      dbMenu.value.name = value
    }
  },
})
let timer: ReturnType<typeof setTimeout> | null = null
const delay = 180
const projectList = computed<typeof projectPinia.projectList>(() => (window as any).$utils.clone(projectPinia.projectList, true))

async function exitEditMode() {
  if (!dbMenu.value || !(dbMenu.value.id))
    return
  const node = (window as any).$utils.clone(dbMenu.value, true)

  const result = await invoke<ResultType<ProjectNode[]>>('set_project_node', { node })
  if (result.status) {
    dbMenu.value = undefined
    projectPinia.getProjectList()
  }
}

function treeToggle(event: TreeItemToggleEvent<ProjectNode>) {
  currentMenu.value = event.detail.value
  const routerMode = route.name === 'project' ? 'replace' : 'push'
  router[routerMode]({ name: 'project', query: {
    id: currentMenu.value?.id,
  } })
}

function handleClick(e: MouseEvent) {
  e.isTrusted && e.stopPropagation()
  if (timer) {
    return
  }
  if (e.isTrusted) {
    timer = setTimeout(() => {
      clearTimeout(timer!)
      timer = null
      const newEvent = new Event('click', { bubbles: true })
      const target = e.target as HTMLElement
      target.dispatchEvent(newEvent)
    }, delay)
  }
}

function handleDblClick(item: ProjectNode) {
  timer && clearTimeout(timer)
  timer = null
  dbMenu.value = item
}

function addChild(parent: ProjectNode) {
  projectPinia.addProject(parent.id)
}
</script>

<template>
  <TreeRoot
    v-slot="{ flattenItems }"
    v-model="currentMenu"
    class="list-none select-none w-full text-stone-700 text-sm font-medium"
    :items="projectList"
    :get-key="(item) => item.name"
    :default-expanded="['components']"
  >
    <TreeItem
      v-for="item in flattenItems"
      :key="item.value.id || '0000'"
      v-slot="{ isSelected }"
      :style="{ 'padding-left': `${(item.level - 1) < 0 ? 0 : (item.level - 1 - 0.125)}rem` }"
      v-bind="item.bind"
      class="flex items-center py-1 px-0 my-0.5 rounded outline-none  data-selected:bg-gray-200"
      @toggle="treeToggle"
    >
      <Icon
        :icon="item.value.icon || 'lucide:file'"
        class="h-4 w-4"
      />
      <div class=" flex pl-1 justify-between items-center flex-1  min-w-0 relative" :class="dbMenu?.id === item.value.id ? '' : 'group'">
        <div class="flex-1 h-max overflow-hidden min-w-0" :class=" item.value.children && item.value.children.length ? 'font-bold text-black' : ' text-gray-600' ">
          <div v-if="dbMenu?.id !== item.value.id" class=" w-full h-7 flex justify-start items-center border border-transparent" @click="handleClick" @dblclick="handleDblClick(item.value)">
            <span class=" truncate">
              {{ item.value.name }}
            </span>
          </div>
          <div v-if="dbMenu?.id === item.value.id" class="bg-transparent h-7 w-full">
            <Input
              :id="item.value.id"
              v-model="dbMenuTitle"
              class=" px-1 py-px w-full h-full overflow-hidden focus-visible:ring-0 focus-visible:ring-transparent"
              @blur="exitEditMode"
              @vue:mounted="(e) => {
                e?.el?.focus()
              }"
              @keyup.enter="exitEditMode"
            />
          </div>
        </div>
        <div class=" leading-1 justify-between items-center cursor-pointer hidden group-hover:flex absolute right-0 top-0 bottom-0 bg-radial to-transparent" :class="isSelected ? 'from-gray-200' : 'from-gray-100'">
          <TooltipProvider :delay-duration="800">
            <Tooltip>
              <TooltipTrigger as-child>
                <span class=" inline-block p-1 rounded-sm  transition-bg duration-200 ease-in" :class="isSelected ? 'hover:bg-gray-300' : 'hover:bg-gray-200'" @click.stop="addChild(item.value)">
                  <Icon
                    icon="heroicons:plus-20-solid"
                    class="h-4 w-4"
                  />
                </span>
                <TooltipContent>
                  <p>Add child</p>
                </TooltipContent>
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider :delay-duration="800">
            <Tooltip>
              <TooltipTrigger as-child>
                <span class=" inline-block p-1 rounded-sm transition-bg duration-200 ease-in" :class="isSelected ? 'hover:bg-gray-300' : 'hover:bg-gray-200'" @click.stop>
                  <Icon
                    icon="heroicons:minus-20-solid"
                    class="h-4 w-4"
                  />
                </span>
                <TooltipContent>
                  <p>Delete</p>
                </TooltipContent>
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </TreeItem>
  </TreeRoot>
</template>

<style scoped>
:deep(li[data-reka-collection-item]){
    padding: 1px 0;
}
</style>
