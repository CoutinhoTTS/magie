import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { funiListPageV2PropertyConfig } from '~/shared/propertyConfigs/funiListPageV2'
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

/**
 * 组件映射表 - 根据 prop 添加对应的编辑组件
 */
function getComponentForProp(prop: string): any {
  const componentMap: Record<string, any> = {
    isShowSearch: Switch,
    showTab: Switch,
    reloadOnActive: Switch,
    label: <Input class="w-30" />,
    'curdOption.searchOnFormChange': Switch,
    'curdOption.pagination': Switch,
  }
  return componentMap[prop]
}

/**
 * 为配置项添加 component 字段（递归处理 children）
 */
function addComponentToConfig(config: typeof funiListPageV2PropertyConfig) {
  return config.map((item) => {
    const result: any = {
      ...item,
      component: getComponentForProp(item.prop),
    }
    if (item.children?.length) {
      result.children = item.children.map((child) => ({
        ...child,
        component: getComponentForProp(child.prop),
      }))
    }
    return result
  })
}

/**
 * 合并共享配置与组件
 * 从共享模块导入纯数据配置，添加 component 字段
 */
export const propertyConfig = addComponentToConfig(funiListPageV2PropertyConfig)
