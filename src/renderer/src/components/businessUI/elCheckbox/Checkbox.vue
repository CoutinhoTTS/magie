<script lang="ts" setup>
import { ref } from 'vue'

// const checked1 = ref(true)
const checked2 = ref(false)
// const checked3 = ref(false)
</script>

<template>
  <div>
    <!-- <el-checkbox v-model="checked1" label="Option 1" size="large" /> -->
    <el-checkbox v-bind="$attrs" v-model="checked2" label="A" />
    <!-- <el-checkbox v-model="checked3" label="Option 3" size="small" /> -->
  </div>
</template>
