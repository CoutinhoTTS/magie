export interface MapTreeNode {
  magieNodeId: string | null
  magieSourceMap: string | null
}

export function useLoopDom(el: HTMLElement, filter: (cur: HTMLElement) => boolean) {
  const result: HTMLElement[] = []
  let cur: HTMLElement | null = el
  while (cur) {
    if (filter(cur)) {
      result.push(cur)
    }
    cur = cur.parentElement
  }
  return result
}

export function useLoopDataSet(nodes: Element[]) {
  const mapTree: MapTreeNode[] = []
  for (const node of nodes) {
    const magieNodeId = node instanceof HTMLElement ? (node.dataset?.magieNodeId as string) : null
    if (magieNodeId) {
      mapTree.push({ magieNodeId, magieSourceMap: null })
    }
    const magieSourceMap = node instanceof HTMLElement ? node.dataset?.magieSourceMap : null
    const endNode = mapTree[mapTree.length - 1]
    if (!endNode.magieSourceMap && magieSourceMap) {
      endNode.magieSourceMap = magieSourceMap
    }
  }
  return mapTree
}

export function parseFn(str: string) {
  const match = str.match(/^fn\(([^()]*)\)$/)
  if (!match)
    return null
  return match[1]
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

export function locationMap(mapNode: MapTreeNode[], current: any) {
  let metond = ''
  let currentMap = ''
  let currentType = ''
  let magieNodeId = ''
  let methodType = ''

  for (const node of mapNode) {
    currentMap = node.magieSourceMap || ''
    const maps = currentMap.split('.')
    magieNodeId = node.magieNodeId || ''
    if (magieNodeId && currentType === 'array' && Array.isArray(current)) {
      current = current.find((item: any) => item.id === magieNodeId)
    }
    for (const map of maps) {
      if (map === 'root')
        continue
      if (map.includes(':')) {
        const [key, type, methodName, methodTypeName] = map.split(':')
        current = current[key]
        currentType = type
        metond = methodName
        methodType = methodTypeName

        if (metond && !['push', 'splice', 'unshift'].includes(metond) && methodType && Array.isArray(current)) {
          if (metond === 'index') {
            current = current[Number(methodType)]
          }
          else {
            current = current.find((item: any) => item[key] === methodType)
          }
        }
      }
      else {
        current = current[map]
      }
    }
  }

  return { current, metond, currentMap, currentType, magieNodeId, methodType }
}
