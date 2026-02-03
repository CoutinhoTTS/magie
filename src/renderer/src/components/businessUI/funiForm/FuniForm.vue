<script setup lang="ts">
import { reactive, ref } from 'vue'

const from = ref<any>(null)
const aschema = reactive([
  {
    label: '合同号',
    component: null,
    prop: 'contractSn',
  },
  {
    label: '合同名称',
    component: 'el-input',
    prop: 'contractName',
  },
  {
    label: '归档编号',
    component: null,
    prop: 'archiveSn',
  },
  {
    label: '合同金额(元)',
    component: 'el-input-number',
    prop: 'contractAmount',

  },
  {
    label: '合同签订时间',
    component: 'el-date-picker',
    prop: 'signDate',
  },
  {
    label: '创建时间',
    component: null,
    prop: 'createTime',
  },
  {
    label: '生效时间',
    component: null,
    prop: 'takeEffectTime',
  },

])
</script>

<template>
  <div class="w-[400px]">
    <FuniForm
      :schema="aschema"
      :col="2"
      @get-form="(e:any) => (from = e)"
    />
  </div>
</template>
