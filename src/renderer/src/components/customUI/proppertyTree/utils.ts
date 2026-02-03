import type { ComputedRef } from 'vue'
import { computed } from 'vue'

export function getNestedValue(obj: any, path: string): any {
  if (!path)
    return obj
  const keys = path.split('.')
  let result = obj
  for (const key of keys) {
    if (result == null)
      return undefined

    const arrayMatch = key.match(/^(.+)\[(\d+|number)\]$/)
    if (arrayMatch) {
      const [, prop, index] = arrayMatch
      result = result[prop]
      if (result == null)
        return undefined
      if (index === 'number') {
        result = result[0]
      } else {
        result = result[Number.parseInt(index, 10)]
      }
    } else {
      result = result[key]
    }
  }
  return result
}

export function setNestedValue(obj: any, path: string, value: any): void {
  if (!path) {
    Object.assign(obj, value)
    return
  }

  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (current[key] == null || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
}

export function createNestedPropModel(
  obj: ComputedRef<any[]>,
  item: { prop: string },
  index: number,
  emit: (event: 'update:modelValue', value: any[]) => void,
): ComputedRef<any> {
  return computed({
    get: () => {
      return getNestedValue(obj.value[index], item.prop)
    },
    set: (val) => {
      const newValue = [...obj.value]
      if (!newValue[index]) {
        newValue[index] = {}
      }
      setNestedValue(newValue[index], item.prop, val)
      if (emit) {
        emit('update:modelValue', newValue)
      }
    },
  })
}

export function getItemLabel(item: any, labelProp: string | undefined, fallback: string): string {
  if (!labelProp)
    return fallback
  return getNestedValue(item, labelProp) || fallback
}
