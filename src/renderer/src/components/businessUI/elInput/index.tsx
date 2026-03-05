import { Select } from '@/components/customUI/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { elInputPropertyConfig } from '~/shared/propertyConfigs/elInput'
import InputComp from './Input.vue'

export const ElInput = InputComp as typeof import('element-plus')['ElInput']
export const defaultProps = {
  placeholder: '请输入',
  type: 'text',
  label: '输入框',
  clearable: false,
  disabled: false,
}

/**
 * 组件映射表 - 根据 prop 添加对应的编辑组件
 */
function getComponentForProp(prop: string) {
  const componentMap: Record<string, any> = {
    label: <Input class="w-30" />,
    type: (
      <Select
        class="w-30"
        triggerClass="w-30"
        options={[{
          label: '文本',
          value: 'text',
        }]}
      />
    ),
    placeholder: <Input class="w-30" />,
    clearable: Switch,
    disabled: Switch,
  }
  return componentMap[prop]
}

/**
 * 合并共享配置与组件
 * 从共享模块导入纯数据配置，添加 component 字段
 */
export const propertyConfig = elInputPropertyConfig.map(item => ({
  ...item,
  component: getComponentForProp(item.prop),
}))
