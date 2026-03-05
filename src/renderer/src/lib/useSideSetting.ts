import type { Ref } from 'vue'
import type { LocalSettings, ResultType } from '~/types'
import { watchDebounced } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { mid } from '@/utils'
import useWindowResize from './useWindowResize'

const invoke = window.api.invoke

export default defineStore('side', () => {
  const openLeftSide = ref(true)
  const leftSideWidth = ref(0)
  const fullWidth = ref(window?.innerWidth || 0.0)
  const defaultRightSideWidth = 300
  const openRightSide = ref(false)
  const openChatSide = ref(false)
  const maxRightWidth = 500
  const maxChatWidth = 400
  const maxLiftWidth = 400
  const rightSideWidth = ref(0)
  const chatSideWidth = ref(0)
  const minRightSideWidth = 80
  const minLeftSideWidth = 220
  const timer = 250
  const disabledStates = reactive({
    left: false,
    right: false,
    chat: false,
  })

  onMounted(() => {
    useWindowResize(async () => {
      resize()
    })
  })

  const leftSideWidthPercent = computed(() => {
    return (leftSideWidth.value / fullWidth.value) * 100
  })

  // Available width for chat side (full width minus left panel)
  const chatAvailableWidth = computed(() => {
    return Math.max(
      fullWidth.value - (openLeftSide.value ? leftSideWidth.value : 0),
      1,
    )
  })

  // Available width for right side (full width minus left and chat panels)
  const rightAvailableWidth = computed(() => {
    return Math.max(
      fullWidth.value
      - (openLeftSide.value ? leftSideWidth.value : 0)
      - (openChatSide.value ? chatSideWidth.value : 0),
      1,
    )
  })

  const rightSideWidthPercent = computed(() => {
    return (rightSideWidth.value / rightAvailableWidth.value) * 100
  })

  const chatSideWidthPercent = computed(() => {
    return (chatSideWidth.value / chatAvailableWidth.value) * 100
  })

  const minLeftSideWidthPercent = computed(() => {
    if (disabledStates.left)
      return 0
    return (minLeftSideWidth / fullWidth.value) * 100
  })

  const minRightSideWidthPercent = computed(() => {
    if (disabledStates.right)
      return 0
    return (minRightSideWidth / rightAvailableWidth.value) * 100
  })

  const minChatSideWidthPercent = computed(() => {
    if (disabledStates.chat)
      return 0
    return (minRightSideWidth / chatAvailableWidth.value) * 100
  })

  const maxRightPercent = computed(() => {
    return (maxRightWidth / rightAvailableWidth.value) * 100
  })

  const maxChatPercent = computed(() => {
    return (maxChatWidth / chatAvailableWidth.value) * 100
  })
  const maxLiftPercent = computed(() => {
    return (maxLiftWidth / fullWidth.value) * 100
  })

  function setLeftSideWidth(percent?: number) {
    const pixelValue = ((percent ?? leftSideWidthPercent.value) * fullWidth.value) / 100
    leftSideWidth.value = mid(minLeftSideWidth, pixelValue, 500)
  }

  // 通用的切换函数创建器
  function createSwitchFn(
    side: 'left' | 'right' | 'chat',
    options: {
      openState: Ref<boolean>
      widthState: Ref<number>
      defaultWidth: number
      widthKey: 'left_side_width' | 'right_side_width' | 'chat_side_width'
    },
  ) {
    return async function (forceState?: boolean) {
      const newState = forceState ?? !options.openState.value
      disabledStates[side] = true

      await nextTick()
      options.widthState.value = 0
      if (newState) {
        options.openState.value = true
        await nextTick()
        await resetWidth()
        await new Promise((resolve) => {
          setTimeout(() => {
            disabledStates[side] = false
            resolve(null)
          }, timer)
        })
      }
      else {
        await new Promise((resolve) => {
          setTimeout(async () => {
            await resetWidth()
            options.openState.value = false
            disabledStates[side] = false
            resolve(null)
          }, timer)
        })
      }

      async function resetWidth() {
        const { data } = await invoke<ResultType<LocalSettings>>('get_local_data')
        options.widthState.value = data?.[options.widthKey] || options.defaultWidth
      }
      saveLocalData()
    }
  }

  // 使用工厂函数创建三个 switch 函数
  const switchLeftSide = createSwitchFn('left', {
    openState: openLeftSide,
    widthState: leftSideWidth,
    defaultWidth: minLeftSideWidth,
    widthKey: 'left_side_width',
  })

  const switchRightSide = createSwitchFn('right', {
    openState: openRightSide,
    widthState: rightSideWidth,
    defaultWidth: defaultRightSideWidth,
    widthKey: 'right_side_width',
  })

  const switchChatSide = createSwitchFn('chat', {
    openState: openChatSide,
    widthState: chatSideWidth,
    defaultWidth: defaultRightSideWidth,
    widthKey: 'chat_side_width',
  })

  function setRightSideWidth(percent?: number) {
    const pixelValue = ((percent ?? rightSideWidthPercent.value) * rightAvailableWidth.value) / 100
    rightSideWidth.value = mid(maxRightWidth, pixelValue, minRightSideWidth)
  }

  function setChatSideWidth(percent?: number) {
    const pixelValue = ((percent ?? chatSideWidthPercent.value) * chatAvailableWidth.value) / 100
    chatSideWidth.value = mid(maxChatWidth, pixelValue, minRightSideWidth)
  }

  async function initData() {
    const result = await invoke<ResultType<LocalSettings>>('get_local_data')
    if (result.status && result.data) {
      switchLeftSide(result?.data?.open_left_side ?? true)
      switchRightSide(result?.data?.open_right_side ?? false)
      switchChatSide(result?.data?.open_chat_side ?? false)
    }
  }

  async function init() {
    await initData()
  }

  async function resize() {
    fullWidth.value = window?.innerWidth
  }

  function saveLocalData() {
    invoke('set_local_data', {
      params: {
        open_left_side: openLeftSide.value,
        left_side_width: leftSideWidth.value,
        open_right_side: openRightSide.value,
        open_chat_side: openChatSide.value,
        right_side_width: rightSideWidth.value,
        chat_side_width: chatSideWidth.value,
      },
    })
  }
  watchDebounced([
    () => openLeftSide.value,
    () => leftSideWidth.value,
    () => openRightSide.value,
    () => openChatSide.value,
    () => rightSideWidth.value,
    () => chatSideWidth.value,
  ], () => {
    if (Object.values(disabledStates).some(v => v)) {
      return
    }

    saveLocalData()
  }, { debounce: 200 })

  return { leftSideWidthPercent, rightSideWidthPercent, chatSideWidthPercent, minLeftSideWidthPercent, minRightSideWidthPercent, minChatSideWidthPercent, setLeftSideWidth, init, defaultRightSideWidth, switchLeftSide, openLeftSide, resize, openRightSide, switchRightSide, openChatSide, switchChatSide, setRightSideWidth, setChatSideWidth, maxRightPercent, maxChatPercent, disabledStates, maxLiftPercent }
})
