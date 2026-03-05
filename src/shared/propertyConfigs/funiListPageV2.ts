import type { PropertyConfigItem } from './types'

/**
 * FuniListPageV2 组件的属性配置
 * 注意：component 字段由渲染进程单独维护
 */
export const funiListPageV2PropertyConfig: PropertyConfigItem[] = [
  {
    label: '是否显示搜索',
    prop: 'isShowSearch',
    type: 'boolean',
  },
  {
    label: '是否显示Tab',
    prop: 'showTab',
    type: 'boolean',
    description: '当Tab只有一个的时候默认是不显示的。',
  },
  {
    label: 'Tab激活时重新加载',
    prop: 'reloadOnActive',
    type: 'boolean',
    description: '切换tab的时候是否重新加载数据。',
  },
  {
    label: 'Tab配置',
    type: 'array:children',
    prop: 'cardTab',
    isTabs: true,
    children: [
      {
        label: 'Tab名称',
        prop: 'label',
        type: 'string',
        defaultValue: 'tab',
      },
      {
        label: '搜索配置',
        prop: 'searchConfig.schema',
        type: 'array:children',
      },
      {
        label: '自动查询',
        prop: 'curdOption.searchOnFormChange',
        type: 'boolean',
        description: '高级查询表单值发生变化时是否自动发起列表查询。',
      },
      {
        label: '是否分页',
        prop: 'curdOption.pagination',
        type: 'boolean',
      },
      {
        label: '列',
        prop: 'curdOption.columns',
        type: 'array:children',
        description: '列表的列配置',
      },
      {
        label: '按钮',
        prop: 'curdOption.btns',
        type: 'array:children',
        description: '表头的按钮配置',
      },
    ],
  },
]
