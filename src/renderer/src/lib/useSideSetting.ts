import type { LocalSettings, ResultType } from '~/types'
import { watchDebounced } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const invoke = window.api.invoke

export default defineStore('side', () => {
  const openLeftSide = ref(true)
  const leftSideWidthPercent = ref(0.0)
  const leftSideWidth = ref(0)
  const fullWidth = ref(window?.innerWidth || 0.0)
  const defaultLeftSideWidth = 220
  const minHeaderWidth = 140
  const openRightSide = ref(false)
  const openRightSideWidthPercent = ref(0.0)
  const openChatSide = ref(false)
  const openChatSideWidthPercent = ref(0.0)

  function setLeftWidth(value: number, isPercent = false) {
    const resultPercent = isPercent ? value : ((value / fullWidth.value) * 100)
    const result = isPercent ? (value * fullWidth.value) / 100 : value
    leftSideWidthPercent.value = resultPercent
    leftSideWidth.value = result < defaultLeftSideWidth ? defaultLeftSideWidth : result
  }

  async function init(value?: number) {
    if (value === undefined) {
      await initData()
      return
    }
    setLeftWidth(value || defaultLeftSideWidth)
    switchBodyPadding()
  }

  async function resize() {
    fullWidth.value = window?.innerWidth
  }

  function switchTab() {
    openLeftSide.value = !openLeftSide.value
    if (!openLeftSide.value) {
      leftSideWidthPercent.value = 0
    }
    else {
      init(leftSideWidth.value)
    }

    switchBodyPadding()
  }
  function switchBodyPadding() {

  }
  async function switchRightSide(bool?: boolean) {
    openRightSide.value = bool ?? !openRightSide.value
  }

  async function switchChatSide(bool?: boolean) {
    openChatSide.value = bool ?? !openChatSide.value
  }

  function setRightSize(value: number) {
    openRightSideWidthPercent.value = value
  }
  function setChatSize(value: number) {
    openChatSideWidthPercent.value = value
  }

  const defaultRightMinSize = computed(() => {
    return (300 / fullWidth.value) * 100
  })

  const minLeftSideWidthPercent = computed(() => {
    if (!openLeftSide.value) {
      return 0
    }
    init(leftSideWidth.value)
    return (defaultLeftSideWidth / fullWidth.value) * 100
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
    return (80 / fullWidth.value) * 100
  })

  async function initData() {
    const result = await invoke<ResultType<LocalSettings>>('get_local_data')
    if (result.status && result.data) {
      openLeftSide.value = result.data.open_left_side
      leftSideWidthPercent.value = result.data.left_side_width_percent || 0.0
      openRightSide.value = result.data.open_right_side
      openChatSide.value = result.data.open_chat_side
      openRightSideWidthPercent.value = Math.max(Number(result.data.open_right_side_width_percent || 0), defaultRightMinSize.value || 0)
      openChatSideWidthPercent.value = Math.max(Number(result.data.open_chat_side_width_percent || 0), defaultRightMinSize.value || 0)
    }
  }
  watchDebounced([
    () => openLeftSide.value,
    () => leftSideWidthPercent.value,
    () => openRightSide.value,
    () => openChatSide.value,
    () => openRightSideWidthPercent.value,
    () => openChatSideWidthPercent.value,
  ], () => {
    const open_right_side_width_percent = openRightSide.value ? openRightSideWidthPercent.value : Math.max(openRightSideWidthPercent.value, defaultRightMinSize.value)
    const open_chat_side_width_percent = openChatSide.value ? openChatSideWidthPercent.value : Math.max(openChatSideWidthPercent.value, defaultRightMinSize.value)
    invoke('set_local_data', {
      params: {
        open_left_side: openLeftSide.value,
        left_side_width_percent: leftSideWidthPercent.value,
        open_right_side: openRightSide.value,
        open_chat_side: openChatSide.value,
        open_right_side_width_percent,
        open_chat_side_width_percent,
      },
    })
  }, { debounce: 200 })

  return { leftSideWidthPercent, minLeftSideWidthPercent, setLeftWidth, init, defaultLeftSideWidth, switchTab, openLeftSide, resize, minHeaderSize, minHeaderRightSize, openRightSide, switchRightSide, openChatSide, switchChatSide, openRightSideWidthPercent, openChatSideWidthPercent, defaultRightMinSize, setRightSize, setChatSize, rightLimit }
})
