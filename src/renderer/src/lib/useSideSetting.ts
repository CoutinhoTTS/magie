import type { LocalSettings, ResultType } from '~/types'
import { watchDebounced } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, nextTick, onMounted, ref } from 'vue'
import { mid } from '@/utils'
import useWindowResize from './useWindowResize'

const invoke = window.api.invoke

export default defineStore('side', () => {
  const openLeftSide = ref(true)
  const leftSideWidthPercent = ref(0.0)
  const leftSideWidth = ref(0)
  const fullWidth = ref(window?.innerWidth || 0.0)
  const defaultLeftSideWidth = 300
  const minHeaderWidth = 140
  const openRightSide = ref(false)
  const openRightSideWidthPercent = ref(0.0)
  const openChatSide = ref(false)
  const openChatSideWidthPercent = ref(0.0)
  const maxRightWidth = 500
  const maxChatWidth = 400
  const rightWidth = ref(0)
  const chatWidth = ref(0)
  const rightLimitWidth = 80
  const leftLimitWidth = 220

  onMounted(() => {
    useWindowResize(async () => {
      resize()
      await nextTick()
      openLeftSide.value && setLeftWidth(calculateResult(leftSideWidth.value || leftLimitWidth, true))
      openRightSide.value && setRightSize(calculateResult(rightWidth.value || defaultLeftSideWidth, true))
      openChatSide.value && setChatSize(calculateResult(chatWidth.value || defaultLeftSideWidth, true))
    })
  })

  const defaultRightSideWidthPercent = computed(() => {
    return (defaultLeftSideWidth / fullWidth.value) * 100
  })

  const minLeftSideWidthPercent = computed(() => {
    return (leftLimitWidth / fullWidth.value) * 100
  })

  const minHeaderWidthPercant = computed(() => {
    return (minHeaderWidth / fullWidth.value) * 100
  })

  const minHeaderSize = computed(() => {
    if (openLeftSide.value) {
      return leftSideWidthPercent.value
    }
    else {
      return minHeaderWidthPercant.value
    }
  })

  const minHeaderRightSize = computed(() => {
    return 100 - minHeaderSize.value
  })

  const rightLimit = computed(() => {
    return (rightLimitWidth / fullWidth.value) * 100
  })

  const maxRightPercent = computed(() => {
    return (maxRightWidth / fullWidth.value) * 100
  })
  const maxChatPercent = computed(() => {
    return (maxChatWidth / fullWidth.value) * 100
  })

  function calculateResult(value: number): { resultPercent: number, result: number }
  function calculateResult(value: number, isWidth: boolean): number
  function calculateResult(value: number, isWidth = false) {
    if (isWidth) {
      return (value / fullWidth.value) * 100
    }
    const resultPercent = value
    const result = (value * fullWidth.value) / 100
    return { resultPercent, result }
  }

  function setLeftWidth(value?: number) {
    const { resultPercent, result } = calculateResult(value ?? leftSideWidthPercent.value)
    leftSideWidthPercent.value = resultPercent
    leftSideWidth.value = result < defaultLeftSideWidth ? defaultLeftSideWidth : result
  }

  function switchLiftTab() {
    openLeftSide.value = !openLeftSide.value
    if (openLeftSide.value) {
      setLeftWidth(openRightSideWidthPercent.value)
    }
  }

  async function switchRightSide(bool?: boolean) {
    openRightSide.value = bool ?? !openRightSide.value
    if (openRightSide.value) {
      setRightSize(openRightSideWidthPercent.value)
    }
  }

  async function switchChatSide(bool?: boolean) {
    openChatSide.value = bool ?? !openChatSide.value
    if (openRightSide.value) {
      setChatSize(openChatSideWidthPercent.value)
    }
  }

  function setRightSize(value?: number) {
    const { resultPercent, result } = calculateResult(value ?? openRightSideWidthPercent.value)
    openRightSideWidthPercent.value = mid(maxRightPercent.value, resultPercent, rightLimit.value)
    rightWidth.value = mid(maxRightWidth, result, rightLimitWidth)
  }

  function setChatSize(value?: number) {
    const { resultPercent, result } = calculateResult(value ?? openChatSideWidthPercent.value)
    openChatSideWidthPercent.value = mid(maxChatPercent.value, resultPercent, rightLimit.value)
    chatWidth.value = mid(maxChatWidth, result, rightLimitWidth)
  }

  async function initData() {
    const result = await invoke<ResultType<LocalSettings>>('get_local_data')
    if (result.status && result.data) {
      openLeftSide.value = result?.data?.open_left_side || true
      leftSideWidthPercent.value = result?.data?.left_side_width_percent || minLeftSideWidthPercent.value
      openRightSide.value = result?.data?.open_right_side || false
      openChatSide.value = result?.data?.open_chat_side || false
      openRightSideWidthPercent.value = result?.data?.open_right_side_width_percent || defaultRightSideWidthPercent.value
      openChatSideWidthPercent.value = result.data.open_chat_side_width_percent || defaultRightSideWidthPercent.value
      setLeftWidth(leftSideWidthPercent.value)
      setRightSize(openRightSideWidthPercent.value)
      setChatSize(openChatSideWidthPercent.value)
    }
  }

  async function init() {
    initData()
  }

  async function resize() {
    fullWidth.value = window?.innerWidth
  }
  watchDebounced([
    () => openLeftSide.value,
    () => leftSideWidthPercent.value,
    () => openRightSide.value,
    () => openChatSide.value,
    () => openRightSideWidthPercent.value,
    () => openChatSideWidthPercent.value,
  ], () => {
    invoke('set_local_data', {
      params: {
        open_left_side: openLeftSide.value,
        left_side_width_percent: leftSideWidthPercent.value,
        open_right_side: openRightSide.value,
        open_chat_side: openChatSide.value,
        open_right_side_width_percent: openRightSideWidthPercent.value,
        open_chat_side_width_percent: openChatSideWidthPercent.value,
      },
    })
  }, { debounce: 200 })

  return { leftSideWidthPercent, minLeftSideWidthPercent, setLeftWidth, init, defaultLeftSideWidth, switchLiftTab, openLeftSide, resize, minHeaderSize, minHeaderRightSize, openRightSide, switchRightSide, openChatSide, switchChatSide, openRightSideWidthPercent, openChatSideWidthPercent, setRightSize, setChatSize, rightLimit, maxRightPercent, maxChatPercent }
})
