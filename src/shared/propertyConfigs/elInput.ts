import type { PropertyConfigItem } from './types'

/**
 * ElInput 组件的属性配置
 * 注意：component 字段由渲染进程单独维护
 */
export const elInputPropertyConfig: PropertyConfigItem[] = [
  {
    label: 'label名称',
    prop: 'label',
    type: 'string',
    isTop: true,
  },
  {
    label: '输入类型',
    prop: 'type',
    type: 'string',
  },
  {
    label: '输入框占位文本',
    prop: 'placeholder',
    type: 'string',
  },
  {
    label: '是否显示清除按钮',
    prop: 'clearable',
    type: 'boolean',
    description: '只有当 type 不是 textarea时生效',
  },
  {
    label: '是否禁用',
    prop: 'disabled',
    type: 'boolean',
  },
]
