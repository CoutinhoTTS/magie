import type { ModelItem, ResultType } from '~/types'
import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const invoke = window.api.invoke

interface FormItem {
  label: string
  prop: keyof ModelItem
  component: any
}

export default defineStore('model', () => {
  const settingModel = ref(false)
  const formConfig = ref<FormItem[]>([
    {
      label: '模型名称',
      prop: 'name',
      component: <Input></Input>,
    },
    {
      label: '模型Base URL',
      prop: 'url',
      component: <Input></Input>,
    },
    {
      label: '模型接口协议',
      prop: 'compatible_type',
      component: (
        <Select>
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Provider</SelectLabel>
              <SelectItem value="zhipuai">
                Zhipu
              </SelectItem>
              <SelectItem value="kimi-for-coding">
                Kimi
              </SelectItem>
              <SelectItem value="openai">
                Openai
              </SelectItem>
              <SelectItem value="openrouter">
                Openrouter
              </SelectItem>
            </SelectGroup>

          </SelectContent>
        </Select>
      ),
    },
    {
      label: '模型API Key',
      prop: 'api_key',
      component: <Input></Input>,
    },
  ])
  const modelLit = ref<ModelItem[]>([])
  const currentModel = ref<null | ModelItem>(null)
  async function getAllModel() {
    const result = await invoke<ResultType<ModelItem[]>>('get_all_models')
    if (result.status && result.data) {
      modelLit.value = result.data
      currentModel.value = modelLit.value.find(e => e?.selected) ?? null
    }
  }

  function switchSetting() {
    settingModel.value = !settingModel.value
    if (settingModel.value) {
      getAllModel()
    }
  }

  async function setModel(params?: ModelItem): Promise<ResultType<ModelItem>> {
    if (!params)
      return Promise.reject(new Error('params 为空'))
    return invoke<ResultType<ModelItem>>('set_model_value', {
      model: toRaw(params),
    })
  }

  async function setCurrentModel(e: any) {
    const _model = modelLit.value.find(i => i.id === e)
    if (!_model)
      return

    const result = await invoke<ResultType<ModelItem[]>>('set_model_value', {
      model: {
        ...toRaw(_model),
        selected: true,
      },
    })

    if (result.status && result.data) {
      getAllModel()
    }
  }
  getAllModel()

  return {
    settingModel,
    switchSetting,
    getAllModel,
    modelLit,
    formConfig,
    setModel,
    currentModel,
    setCurrentModel,
  }
})
