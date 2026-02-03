import type { MapTreeNode } from './useLoopDom'
import type components from '@/components/businessUI/index'
import type { Page } from '~/types'
import { locationMap, parseFn, useLoopDataSet, useLoopDom } from './useLoopDom'

interface DropOptions {
  overlap: number
  pageRoots?: Page
  currentNode?: typeof components[number] | null
  proxyTarget?: HTMLElement | null
  container?: HTMLElement | null
}
interface Point {
  x: number
  y: number
}

export default class Drop {
  private options: Partial<DropOptions>
  private timer: ReturnType<typeof setTimeout> | null = null
  private selectedTarget: Element | null = null
  debounce = 200
  constructor(options: Partial<DropOptions>) {
    this.options = options
  }

  selectTarget(el: Element) {
    el.classList.add('back-cover')
    this.selectedTarget = el
  }

  private locationNode(mapNode: MapTreeNode[]) {
    const { pageRoots, currentNode } = this.options
    let current: any = pageRoots
    const { metond, methodType, current: _current } = locationMap(mapNode, current)
    current = _current
    const guid = (window as any).$utils.guid() as string
    const match = parseFn(methodType)
    if (match && current && ['push', 'splice', 'unshift'].includes(metond)) {
      const args = match.map((arg) => {
        if (arg === '*') {
          const tagId = `container-${guid}`
          const tagName = currentNode?.name
          return {
            id: tagId,
            name: currentNode?.name,
            tagName,
            tagId,
            props: { hFull: currentNode?.hFull || false, ...(currentNode?.defaultProps || {}) },
            children: [],
            prop: tagId,
            component: tagName,
            label: tagName,
          }
        }
        else {
          return Number(arg)
        }
      })
      current[metond]?.(...args)
    }
  }

  private pushElement(containerList: Element[]) {
    const nodes = [...containerList].reverse().filter((el) => {
      if (!(el instanceof HTMLElement))
        return false
      const hasRenderNodeClass = el.classList.contains('render-node')
      const hasNodeId = Boolean(el.dataset?.magieNodeId)
      const canPush = el.classList.contains('container-can-push')
      const hasSourceMap = Boolean(el.dataset?.magieSourceMap)
      return (hasRenderNodeClass && hasNodeId) || (canPush && hasSourceMap)
    })

    this.locationNode(useLoopDataSet(nodes))
  }

  public clearSelectedTarget() {
    if (this.selectedTarget) {
      this.selectedTarget.classList.remove('back-cover')
      this.selectedTarget = null
    }
  }

  public update(options: Partial<DropOptions> = {}) {
    this.options = { ...this.options, ...options }
  }

  public checDrop(point: Point): void
  public checDrop(point: Point, immediate: boolean): void
  public checDrop(point: Point, immediate = false) {
    const execute = () => {
      this.timer && clearTimeout(this.timer)
      const els = Array.from(document.elementsFromPoint(point.x, point.y) || []).filter((el) => {
        return this.options?.proxyTarget?.contains(el) === false && this.options?.container?.contains(el) === true
      })

      this.clearSelectedTarget()

      if (!Array.isArray(els) || els.length === 0) {
        return
      }
      const containerList = useLoopDom(els[0] as HTMLElement, (el) => {
        if (!el)
          return false
        const isContainerCanPush = el.classList.contains('container-can-push')
        const isRenderNode = el.classList.contains('render-node')
        return isContainerCanPush || isRenderNode
      })
      const el = containerList.find(el => el instanceof HTMLElement && el.classList.contains('container-can-push'))
      if (el) {
        if (immediate) {
          this.pushElement(containerList)
          return
        }
        this.selectTarget(el)
      }
    }

    this.timer && clearTimeout(this.timer)
    if (immediate) {
      execute()
      return
    }

    this.timer = setTimeout(execute, this.debounce)
  }
}
