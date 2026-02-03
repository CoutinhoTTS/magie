import type components from '@/components/businessUI/index'
import type { Page } from '~/types'
import { watchDebounced } from '@vueuse/core'
import Moveable from 'moveable'
import { defineStore } from 'pinia'
import { computed, nextTick, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clearUndefined } from '@/utils/useObject'
import Drop from './useDrop'

const invoke = window.api.invoke

export default defineStore('moveable', () => {
  let dragState: {
    gtaging: boolean
    targetIds: string[]
    initialRect: DOMRect | null
    container: HTMLElement | null
    moveable: any
    proxyTarget: HTMLElement | null
  } = {
    gtaging: false,
    targetIds: [],
    initialRect: null,
    container: null,
    moveable: null,
    proxyTarget: null,
  }
  const route = useRoute()
  const router = useRouter()
  const layerTop = ref(false)

  let scrollContainer: HTMLElement | null = null
  let currentNode: (typeof components[number]) | null = null
  const id = computed(() => route.query.id as string || '')
  let timer: ReturnType<typeof setTimeout> | null = null
  let pageDesignData = reactive<Page>({
    id: 'root',
    name: '',
    tagId: 'design-board',
    children: [],
  })
  const drop = new Drop({
    overlap: 0.75,
    pageRoots: pageDesignData,
  })

  function createproxyTarget() {
    const container = document.createElement('div')
    container.id = 'moveable-proxy-container'
    container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: max-content;
      height: max-content;
      z-index: 9999;
      opacity: 0;
    `
    document.body.appendChild(container)
    container.addEventListener('wheel', (e: any) => {
      e.stopPropagation()
      if (!scrollContainer)
        return
      scrollContainer.scrollTop += e.deltaY
      clearCloneNode()
    })
    return container
  }

  async function cloneNode(source: HTMLElement, node: typeof components[number]) {
    dragState.initialRect = source.getBoundingClientRect()
    const clone = source.cloneNode(true) as HTMLElement
    clone.style.width = `${dragState.initialRect.width}px`
    clone.style.height = `${dragState.initialRect.height}px`
    clone.setAttribute('id', 'moveable-proxy-clone')

    if (!dragState.proxyTarget)
      return
    dragState.proxyTarget.innerHTML = ''
    dragState.proxyTarget?.appendChild(clone)
    dragState.proxyTarget.style.transform = `translate(${dragState.initialRect.left}px, ${dragState.initialRect.top}px)`
    dragState.proxyTarget.style.opacity = '1'
    currentNode = (window as any).$utils.clone(node, true)
    drop.update({ currentNode })
  }

  function clearCloneNode() {
    if (dragState.proxyTarget) {
      dragState.proxyTarget.innerHTML = ''
      dragState.proxyTarget.style.transform = ''
      dragState.proxyTarget.style.opacity = '0'
      currentNode = null
    }
    drop.update({ currentNode })
  }

  function dragStartEvent() { }

  function dragEvent(e: any) {
    drop.checDrop({ x: e.clientX, y: e.clientY })
    if (!dragState.proxyTarget)
      return
    dragState.proxyTarget.style.transform = `translate(${e.beforeTranslate[0]}px, ${e.beforeTranslate[1]}px)`
    dragState.proxyTarget.style.opacity = '1'
    dragState.gtaging = true
  }

  async function dragEndEvent(e: any) {
    drop.checDrop({ x: e.clientX, y: e.clientY }, true)
    drop.clearSelectedTarget()
    clearCloneNode()
    dragState = {
      ...dragState,
      initialRect: null,
    }
    dragState.gtaging = false
    await nextTick()
    timer && clearTimeout(timer)
    timer = setTimeout(() => {
      timer && clearTimeout(timer)
      const elementGuidelines = Array.from(document.querySelectorAll('.container-can-push') ?? [])
      dragState.moveable.setState({
        elementGuidelines,
      }, () => {
        dragState.moveable.updateTarget()
        dragState.moveable.updateSelectors()
        dragState.moveable.updateRect()
      })
    })
  }

  function moveableFactory() {
    const elementGuidelines = Array.from(document.querySelectorAll('.container-can-push') ?? [])
    const moveable = new Moveable(document.body, {
      target: dragState.targetIds,
      draggable: true,
      origin: false,
      snappable: true,
      snapThreshold: 10,
      resizable: false,
      rotatable: false,
      isDisplaySnapDigit: true,
      isDisplayInnerSnapDigit: true,
      rootContainer: document.body,
      individualGroupable: true,
      snapGap: true,
      scrollable: true,
      snapDirections: {
        top: true,
        left: true,
        bottom: true,
        right: true,
        center: true,
        middle: true,
      },
      elementSnapDirections: {
        top: true,
        left: true,
        bottom: true,
        right: true,
        center: true,
        middle: true,
      },
      elementGuidelines,
    })

    moveable.on('dragStart', dragStartEvent)
    moveable.on('drag', dragEvent)
    moveable.on('dragEnd', dragEndEvent)

    return moveable
  }

  function mouseEnterTarget(e: any, node: typeof components[number]) {
    const target = e.target as HTMLElement
    cloneNode(target, node)
  }

  function mouseLeaveTarget() {
    if (dragState.gtaging) {
      return
    }
    clearCloneNode()
  }

  function initMoveable() {
    scrollContainer = document.querySelector('#design .scroll-container>div[data-reka-scroll-area-viewport]') as HTMLElement
    dragState.container = document.querySelector('#design-container') as HTMLElement
    if (!dragState.proxyTarget) {
      dragState.proxyTarget = createproxyTarget()
      dragState.proxyTarget.addEventListener('mouseleave', mouseLeaveTarget)
    }
    drop.update({ proxyTarget: dragState.proxyTarget, container: dragState.container })
    dragState.targetIds = ['#moveable-proxy-container']
    dragState.moveable = moveableFactory()
  }

  async function getPageDesignDate() {
    if (!id.value) { pageDesignData = { id: void 0, name: '', children: [], tagId: 'design-board' }; return };
    const data = await invoke<Page>('get_page_data', { id: id.value })
    pageDesignData = data || { id: null, name: '', children: [], tagId: 'design-board' }
    drop.update({ pageRoots: pageDesignData })
  }

  function switchLayer() {
    layerTop.value = !layerTop.value
  }

  watchDebounced(id, () => {
    const query = clearUndefined({
      ...route.query,
      id: id.value,
    })
    router.replace({ query })
    getPageDesignDate()
  }, { debounce: 100 })

  return { initMoveable, mouseEnterTarget, pageDesignData, layerTop, switchLayer }
})
