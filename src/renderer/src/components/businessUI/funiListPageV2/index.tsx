import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import FuniListPageV2Comp from './FuniListPageV2.vue'

const FuniListPageV2 = FuniListPageV2Comp as any
export { FuniListPageV2 }

export const defaultProps = {
  isShowSearch: true,
  showTab: false,
  reloadOnActive: false,
  cardTab: [
    {
      label: 'Tab1',

      searchConfig: {
        schema: [],
      },
      lodaData: () => {
        return Promise.resolve({
          list: [],
          total: 0,
        })
      },
      curdOption: {
        searchOnFormChange: true,
        pagination: true,
        colNumber: 4,
        btns: [],
        columns: [
          {
            label: '表头001',
            prop: 'data001',
          },
        ],
      },
    },
  ],
}

export const propertyConfig = [
  {
    label: '是否显示搜索',
    prop: 'isShowSearch',
    type: 'boolean',
    component: Switch,
  },
  {
    label: '是否显示Tab',
    prop: 'showTab',
    type: 'boolean',
    description: '当Tab只有一个的时候默认是不显示的。',
    component: Switch,
  },
  {
    label: 'Tab激活时重新加载',
    prop: 'reloadOnActive',
    type: 'boolean',
    component: Switch,
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
        component: <Input class=" w-[120px]" />,
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
        component: Switch,
      },
      {
        label: '是否分页',
        prop: 'curdOption.pagination',
        type: 'boolean',
        component: Switch,
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
