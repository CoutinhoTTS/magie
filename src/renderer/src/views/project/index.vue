<script setup lang="ts">
import type { ProjectNode, ResultType } from '~/types'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import useProject from '@/lib/useProject'

const invoke = window.api.invoke

const projectPinia = useProject()
const projectFlatList = computed(() => [
  ...projectPinia?.addMode
    ? [
        {
          id: null,
          name: '',
          icon: 'heroicons:folder-20-solid',
          children: [],
          parent_id: projectPinia.parentId,
          sort_order: projectPinia.projectList.length + 1,
        },
      ]
    : [],
  ...projectPinia.flattenNodes((window as any).$utils.clone(projectPinia.projectList, true)),
])
const route = useRoute()

function exitEditMode(id: number | null, event: FocusEvent | KeyboardEvent) {
  if (!id)
    return
  if (event.type === 'keyup') {
    const target = event.target as HTMLInputElement
    target?.blur?.()
    return
  }
  const projectItem = projectFlatList.value.find(item => item.id === id)
  if (!projectItem)
    return
  saveProject(projectItem)
}

async function saveProject(projectItem: ProjectNode) {
  const result = await invoke<ResultType<ProjectNode[]>>('set_project_node', {
    node: { ...projectItem, sort_order: Number(projectItem.sort_order) || 1 },
  })
  if (result?.status) {
    projectPinia.savedProject()
    projectPinia.getProjectList()
  }
}
</script>

<template>
  <ScrollArea class="w-full h-full p-2">
    <div class=" grid gap-4 " style="grid-template-columns:repeat(auto-fit, minmax(400px, 1fr))">
      <div v-for="projectItem in projectFlatList" :key="projectItem.id || '000'" class="border rounded-xl p-4 relative transition-border duration-500 ease-in-out" :class="route.query.id === projectItem.id ? ' border-blue-300' : ''">
        <div class="font-bold flex justify-between items-center ">
          <div class=" flex justify-start items-center gap-2">
            <Icon
              class=" inline-block"
              :icon="projectItem.icon"
            />
            {{ projectItem.name }}
          </div>
          <div>
            <span v-if="!(projectItem.id) && projectPinia.addMode" class=" inline-block p-1 hover:bg-gray-200 rounded-sm transition-bg duration-200 ease-in" @click="saveProject(projectItem)">
              <Icon

                icon="mynaui:save"
                class=" cursor-pointer"
              />
            </span>
          </div>
        </div>
        <div>
          <form action="" class=" mt-4 flex flex-col gap-2">
            <div class=" flex flex-col">
              <label for="title" class=" mb-1 text-sm font-medium">Project Title</label>
              <Input v-model="projectItem.name" @blur="exitEditMode(projectItem.id, $event)" @keyup.enter="exitEditMode(projectItem.id, $event)" />
            </div>
            <div class=" flex flex-col">
              <label for="icon" class=" mb-1 text-sm font-medium">Project Icon</label>
              <Input v-model="projectItem.icon" @blur="exitEditMode(projectItem.id, $event)" @keyup.enter="exitEditMode(projectItem.id, $event)" />
            </div>

            <div class=" flex flex-col">
              <label for="icon" class=" mb-1 text-sm font-medium">Sort</label>
              <Input v-model="projectItem.sort_order" @blur="exitEditMode(projectItem.id, $event)" @keyup.enter="exitEditMode(projectItem.id, $event)" />
            </div>
          </form>
        </div>
      </div>
    </div>
  </ScrollArea>
</template>

<style scoped>
.bg-glass-gradient {
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.7) 80%,
    rgb(255, 255, 255) 90%,
    rgb(255, 255, 255) 100%
  );
}

.cover-enter-active,
.cover-leave-active {
    transition: opacity .8s;
}

.cover-enter,
.cover-leave-to {
    opacity: 0;
}
</style>
