import { Select } from '@/components/customUI/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import InputComp from './Input.vue'

export const ElInput = InputComp as typeof import('element-plus')['ElInput']
export const defaultProps = {
  placeholder: '请输入',
  type: 'text',
  label: '输入框',
  clearable: false,
  disabled: false,
}

export const propertyConfig = [
  {
    label: 'label名称',
    prop: 'label',
    type: 'string',
    isTop: true,
    component: <Input class=" w-[120px]" />,
  },
  {
    label: '输入类型',
    prop: 'type',
    type: 'string',
    component: (
      <Select
        class="w-[120px]"
        triggerClass="w-[120px]"
        options={[{
          label: '文本',
          value: 'text',
        }]}
      />
    ),
  },
  {
    label: '输入框占位文本',
    prop: 'placeholder',
    type: 'string',
    component: <Input class=" w-[120px]" />,
  },
  {
    label: '是否显示清除按钮',
    prop: 'clearable',
    type: 'boolean',
    component: Switch,
    description: '只有当 type 不是 textarea时生效',
  },
  {
    label: '是否禁用',
    prop: 'disabled',
    type: 'boolean',
    component: Switch,
  },
]
