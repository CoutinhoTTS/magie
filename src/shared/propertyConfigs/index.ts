import type { PropertyConfigItem } from './types'
import { elInputPropertyConfig } from './elInput'
import { funiListPageV2PropertyConfig } from './funiListPageV2'

export * from './types'

/**
 * 组件属性配置注册表
 * key: 组件 tagName
 * value: 属性配置数组
 */
export const propertyConfigRegistry: Record<string, PropertyConfigItem[]> = {
  ElInput: elInputPropertyConfig,
  FuniListPageV2: funiListPageV2PropertyConfig,
  // 其他组件的配置可以在这里添加
}

/**
 * 根据 tagName 获取组件的属性配置
 * @param tagName 组件标签名
 * @returns 属性配置数组，如果不存在则返回 undefined
 */
export function getPropertyConfig(tagName: string): PropertyConfigItem[] | undefined {
  return propertyConfigRegistry[tagName]
}
