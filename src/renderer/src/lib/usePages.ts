import type { Page } from '~/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export default defineStore('pages', () => {
  const pageList = ref<Array<Page>>([])

  function getPageList() {
    pageList.value = []
  }

  return { pageList, getPageList }
})
