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
</script>

<template>
  <header class="w-full h-8 flex justify-between items-center absolute top-0 left-0 z-1 select-none titlebar border-b bg-background">
    <div
      class="h-full w-full flex "
    >
      <div class="h-full" :style="{ width: setting.openLeftSide ? `${setting.leftSideWidthPercent}%` : `${setting.minHeaderSize}%` }">
        <div class=" h-full w-full flex justify-end items-center">
          <!-- <WindowControls class="h-full flex items-center" /> -->
          <div class="flex justify-end items-center gap-2 h-max pr-2 relative ">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <span class="inline-block cursor-pointer relative size-4.5 btn" @click.stop="setting.switchTab">
                    <Icon :icon="setting.openLeftSide ? 'codicon:layout-sidebar-left' : 'codicon:layout-sidebar-left-off'" class="size-4.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>side</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <span class="inline-block cursor-pointer relative size-4.5 btn" @click.stop="switchPages">
                    <Icon icon="iconoir:multiple-pages" class="size-4.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>pages</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <div class="h-full" :style="{ width: setting.openLeftSide ? `${100 - setting.leftSideWidthPercent}%` : `${100 - setting.minHeaderSize}%` }">
        <div data-tauri-drag-region class="h-full flex justify-center items-center  px-4 relative">
          <div class=" font-bold pointer-events-none">
            {{ route.meta?.title || 'FUNI DESIGN' }}
          </div>
          <div class=" h-full py-1 absolute left-4">
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
          <div class=" h-full absolute right-4 flex justify-center items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <span v-show="route.name === 'design'" class="inline-block cursor-pointer relative size-4.5 btn" @click.stop="setting.switchRightSide(undefined)">
                    <Icon :icon="setting.openRightSide ? 'codicon:layout-sidebar-right' : 'codicon:layout-sidebar-right-off'" class="size-4.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>property</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <span class="inline-block cursor-pointer relative size-4.5 btn" @click.stop="setting.switchChatSide(undefined)">
                    <Icon icon="akar-icons:chat-dots" class="size-4.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>chat</p>
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
