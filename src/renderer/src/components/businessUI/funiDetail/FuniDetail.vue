<script setup lang="ts">
import { computed, ref } from 'vue'
import Base01 from './components/base01.vue'

const bizName = ref('edit')
const steps = computed(() => {
  return [
    {
      title: '基本信息01',
      preservable: true,
      type: Base01,
      props: {},
      on: {},
    },
    {
      title: '基本信息02',
      preservable: false,
      type: 'FuniIcon',
      props: {
        icon: 'skill-icons:nodejs-dark',
        style: {
          fontSize: '4em',
        },
      },
    },
  ]
})
const detailHeadOption = computed(() => ({
  title: '编辑状态',
  no: '编号',
  status: '状态',
  statusName: '状态名称',
}))
</script>

<template>
  <div class=" w-[800px]">
    <funi-detail :biz-name="bizName" :steps="steps" :detail-head-option="detailHeadOption || {}" />
  </div>
</template>
