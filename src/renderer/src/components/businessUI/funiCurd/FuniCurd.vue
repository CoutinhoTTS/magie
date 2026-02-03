<script setup lang="ts">
import { reactive } from 'vue'

const columns = reactive([
  {
    label: '第一列',
    prop: '1',
  },
  {
    label: '第二列',
    prop: '2',
  },

  {
    label: '第三列',
    prop: '3',
  },
  {
    label: '第四列',
    prop: '4',
  },
])
</script>

<template>
  <div class=" w-100">
    <FuniCurdV2 :pagination="false" :columns />
  </div>
</template>
