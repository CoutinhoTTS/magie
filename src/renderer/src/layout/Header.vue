<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import useModel from '@/lib/useModel'
import useSideSetting from '@/lib/useSideSetting'

const setting = useSideSetting()
const router = useRouter()
const route = useRoute()
const canForward = ref(false)
const canBack = ref(false)
const model = useModel()

function switchPages() {
  router.push({
    path: '/views',
  })
}

function switchRoute(value: -1 | 1) {
  router.go(value)
}

function setingModel() {
  if (!model.settingModel && !setting.openChatSide) {
    setting.switchChatSide()
  }
  model.switchSetting()
}

watch(() => route, () => {
  const { state, length } = window.history
  canBack.value = state.position !== 0
  canForward.value = state.position !== length - 1
}, {
  deep: true,
  immediate: true,
})

const headerButtons = [
  {
    key: 'side',
    get icon() {
      return setting.openLeftSide ? 'codicon:layout-sidebar-left' : 'codicon:layout-sidebar-left-off'
    },
    onClick: () => setting.switchLeftSide(),
    tooltip: 'side',
  },
  {
    key: 'property',
    get icon() {
      return setting.openRightSide ? 'codicon:layout-sidebar-right' : 'codicon:layout-sidebar-right-off'
    },
    onClick: () => setting.switchRightSide(undefined),
    tooltip: 'property',
    get show() {
      return route.name === 'design'
    },
  },
  {
    key: 'pages',
    icon: 'carbon:page-break',
    onClick: switchPages,
    tooltip: 'pages',
  },
  {
    key: 'chat',
    icon: 'akar-icons:chat-dots',
    onClick: () => setting.switchChatSide(undefined),
    tooltip: 'chat',
  },
]
</script>

<template>
  <header class="w-full h-8 flex justify-between items-center absolute top-0 left-0 z-1 select-none titlebar border-b bg-background">
    <div class="h-full w-full">
      <div data-tauri-drag-region class="h-full flex justify-center items-center  px-4 relative">
        <div class=" font-bold pointer-events-none">
          {{ route.meta?.title || 'FUNI DESIGN' }}
        </div>

        <div class=" h-full absolute right-4 flex justify-center items-center gap-2">
          <div class="h-full py-1">
            <ul class="h-full flex justify-between items-center border rounded-2xl">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <li class=" w-6 flex justify-center items-center cursor-pointer btn" :class="canBack ? '' : 'opacity-20'" @click.stop="switchRoute(-1)">
                      <Icon icon="mynaui:chevron-left" />
                    </li>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Back</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <li class="w-px h-[calc(100%-10px)] bg-gray-500" :class="canBack || canForward ? '' : 'opacity-20'" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <li class=" w-6 flex justify-center items-center cursor-pointer btn" :class="canForward ? '' : 'opacity-20'" @click.stop="switchRoute(1)">
                      <Icon icon="mynaui:chevron-right" />
                    </li>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Forward</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </ul>
          </div>
          <TooltipProvider v-for="btn in headerButtons" :key="btn.key">
            <Tooltip>
              <TooltipTrigger as-child>
                <span
                  v-show="btn.show ?? true"
                  class="inline-block cursor-pointer relative size-4.5 btn"
                  @click.stop="btn.onClick"
                >
                  <Icon :icon="btn.icon" class="size-4.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{{ btn.tooltip }}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <span class="inline-block cursor-pointer relative size-4.5 btn">
                <Icon icon="uil:setting" class="size-4.5" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem class="btn" @click.stop="setingModel">
                模型设置
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.titlebar {
  -webkit-app-region: drag;
}

.titlebar .btn {
  -webkit-app-region: no-drag;
}
</style>
