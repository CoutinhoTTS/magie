<script lang="ts" setup>
import { Button } from '@/components/ui/button'
import { useChatStore } from '@/lib/useChatStore'

const emit = defineEmits<{
  close: []
}>()

const chatStore = useChatStore()
const { getPatchingEvent, removePatchingEvent, getWorkflowRunId, setPatchs } = chatStore
const invoke = window.api.invoke

async function resumeWorkflow(confirmed: boolean) {
  const runId = getWorkflowRunId()
  if (runId) {
    await invoke('workflow:resume', {
      runId,
      resumeData: { confirmed },
    })
  }
}

async function cancel() {
  removePatchingEvent()
  await resumeWorkflow(false)
  setPatchs([])
  emit('close')
}

async function agree() {
  const patching = getPatchingEvent()
  if (Array.isArray(patching) && patching.length) {
    patching.forEach((fn) => {
      if (typeof fn === 'function') {
        fn()
      }
    })
  }
  await resumeWorkflow(true)
  removePatchingEvent()
  setPatchs([])
  emit('close')
}
</script>

<template>
  <div class=" absolute inset-0 z-10 ">
    <!-- 遮罩层 -->
    <div class=" absolute inset-0 bg-black opacity-30" />
    <div class=" absolute pt-4 px-4 pb-8 bg-white rounded-t-2xl w-full bottom-0 left-0 right-0">
      <p class=" text-sm text-gray-600 mb-3">
        是否应用 AI 的修改？
      </p>
      <div class=" flex flex-col gap-3">
        <Button variant="outline" @click.stop="cancel">
          拒绝
        </Button>
        <Button @click.stop="agree">
          同意
        </Button>
      </div>
    </div>
  </div>
</template>
