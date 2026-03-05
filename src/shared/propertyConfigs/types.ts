/**
 * 属性配置项类型定义
 * 用于共享主进程和渲染进程的配置数据
 *
 * 注意：component 字段不包含在共享模块中，由渲染进程单独维护
 */
export interface PropertyConfigItem {
  label: string
  prop: string
  type: string
  description?: string
  isTabs?: boolean
  isField?: boolean
  defaultValue?: any
  isTop?: boolean
  children?: PropertyConfigItem[]
}
