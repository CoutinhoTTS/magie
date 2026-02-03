<script setup lang="tsx">
import { computed } from 'vue'

const schema = computed(() => {
  return [
    {
      prop: 'name',
      label: 'Activity name',
      component: () => <el-input></el-input>,
      rules: [{ required: true, message: '必填', trigger: 'change' }],
    },
    {
      prop: 'delivery',
      label: 'Instant delivery',
      component: 'el-switch',
      rules: [{ required: true, message: '必填', trigger: 'change' }],
    },

    {
      prop: 'zone_1',
      label: 'Activity zone1',
      slots: { default: 'selectSlot', label: 'customLabel' },
      rules: [{ required: true, message: '必填', trigger: 'change' }],
    },
    {
      prop: 'zone_2',
      label: 'Activity zone2',
      slots: { default: 'selectSlot' },
      rules: [{ required: true, message: '必填', trigger: 'change' }],
    },
  ]
})
</script>

<template>
  <funi-form :schema="schema">
    <template #customLabel="{ item }">
      <div>{{ item.prop }}</div>
    </template>
    <template #selectSlot="{ item, formModel }">
      <el-select :key="item.prop" v-model="formModel[item.prop]" placeholder="please select your zone">
        <el-option label="Zone one" value="shanghai" />
        <el-option label="Zone two" value="beijing" />
      </el-select>
    </template>
  </funi-form>
</template>
