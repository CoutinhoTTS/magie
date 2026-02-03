import { defineStore } from 'pinia'
import { ref } from 'vue'
import { locationMap, parseFn, useLoopDataSet, useLoopDom } from './useLoopDom'
import useMoveable from './useMoveable'

export default defineStore('property', () => {
  let startDom: HTMLElement | null = null
  const moveable = useMoveable()
  const pageDesignData = moveable.pageDesignData
  const currentProperty = ref<any>()
  const selectedClassName = 'magie-selected__0000000'

  function setSelected() {
    const selected = document.querySelector(`.${selectedClassName}`)
    selected?.classList.remove(selectedClassName)
    if (!currentProperty.value)
      return
    const el = document.querySelector(`#${currentProperty.value.tagId}`)
    el?.classList.add(selectedClassName)
  }
  function undateStartDom(el: HTMLElement) {
    startDom = el
    const list = useLoopDom(startDom, (el) => {
      if (!el)
        return false
      const isContainerCanPush = el.classList.contains('container-can-push')
      const isRenderNode = el.classList.contains('render-node')
      return isContainerCanPush || isRenderNode
    })
    const nodes = [...list].reverse().filter((el) => {
      if (!(el instanceof HTMLElement))
        return false
      const hasRenderNodeClass = el.classList.contains('render-node')
      const hasNodeId = Boolean(el.dataset?.magieNodeId)
      const canPush = el.classList.contains('container-can-push')
      const hasSourceMap = Boolean(el.dataset?.magieSourceMap)
      return (hasRenderNodeClass && hasNodeId) || (canPush && hasSourceMap)
    })

    const mapNode = useLoopDataSet(nodes)
    let { metond, methodType, current } = locationMap(mapNode, pageDesignData)
    const match = parseFn(methodType)
    if (current && metond === 'push') {
      current = current[current.length - 1]
    }
    if (current && metond === 'unshift') {
      current = current[0]
    }
    if (match && current && metond === 'splice') {
      current = current[Number(match[0]) || 0]
    }
    currentProperty.value = current
    setSelected()
  }
  function updateProperty(options: any) {
    if (!currentProperty.value)
      return
    Object.keys(options).forEach((key) => {
      currentProperty.value[key] = options[key]
    })
  }
  return { undateStartDom, currentProperty, updateProperty }
})
