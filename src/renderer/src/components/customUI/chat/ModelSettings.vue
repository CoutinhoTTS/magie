<script setup lang="tsx">
import type { ModelItem } from '~/types'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import PropertyField from '@/components/customUI/proppertyTree/PropertyField.vue'

const props = defineProps<{
  visible: boolean
  modelList: ModelItem[]
  selectedModel?: ModelItem | null
  formConfig: any[]
}>()

const emit = defineEmits<{
  updateSelectedModel: [value: ModelItem]
  close: []
  addModel: []
  deleteModel: []
  saveModel: [value: ModelItem]
}>()

const localModel = computed({
  get: () => props.selectedModel,
  set: val => val && emit('updateSelectedModel', val),
})

function selectedModelFn(value: ModelItem) {
  emit('updateSelectedModel', value)
}

function updateModelField(key: keyof ModelItem, value: any) {
  if (localModel.value) {
    const updated = { ...localModel.value, [key]: value }
    emit('updateSelectedModel', updated)
  }
}
</script>

<template>
  <div v-if="visible" class="absolute inset-0 bg-white flex flex-col justify-between items-center">
    <div class="w-full text-ml font-bold p-2 box-border border-b flex justify-between items-center select-none">
      <span>
        模型设置
      </span>
      <i class="cursor-pointer" @click.stop="emit('close')">
        <Icon icon="material-symbols:close-rounded" />
      </i>
    </div>
    <div class="w-full flex-1 overflow-y-auto p-2">
      <div class="w-full max-h-80 overflow-y-auto bg-gray-100 rounded-2xl flex flex-col justify-between items-center">
        <ul v-if="modelList?.length" class="w-full overflow-y-auto p-2 flex flex-col justify-start items-center gap-2 text-ml">
          <li
            v-for="value in modelList"
            :key="value.id!"
            class="py-px px-2 rounded-sm cursor-pointer select-none w-full flex justify-between items-center hover:bg-gray-200"
            :class="{
              'bg-gray-200': selectedModel && selectedModel?.id === value?.id,
            }"
            @click="selectedModelFn(value)"
          >
            <span>
              {{ value.name }}
            </span>
            <i class="text-gray-400 hover:text-gray-600" @click.stop="emit('deleteModel')">
              <Icon icon="fluent:delete-20-filled" />
            </i>
          </li>
          <li
            v-if="selectedModel && !selectedModel.id"
            class="bg-gray-200 py-px px-2 rounded-sm cursor-pointer select-none w-full"
            :class="{
              ' text-gray-400': !selectedModel.name,
            }"
          >
            {{ selectedModel.name || 'Inputting...' }}
          </li>
        </ul>
        <div v-else class="w-full h-20 flex justify-center items-center">
          暂无模型
        </div>
        <div class="border-t w-full flex justify-start items-center gap-2 px-2 py-1 cursor-pointer">
          <Icon icon="mynaui:plus" @click="emit('addModel')" />
          <Icon icon="mynaui:minus" />
        </div>
      </div>
      <div v-if="selectedModel" class="w-full bg-gray-100 rounded-2xl flex flex-col justify-start items-center p-2 mt-2">
        <PropertyField
          v-for="item in formConfig"
          :key="item?.prop"
          :model-value="selectedModel[item?.prop as keyof ModelItem]"
          flex-type="col"
          :config="item"
          @update:model-value="(val) => updateModelField(item?.prop as keyof ModelItem, val)"
        />
      </div>
    </div>
  </div>
</template>
