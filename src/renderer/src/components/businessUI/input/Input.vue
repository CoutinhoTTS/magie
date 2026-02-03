<script lang="ts" setup>
import { ref } from 'vue'

const input = ref('')
</script>

<template>
  <el-input
    v-bind="$attrs"
    v-model="input"
  />
</template>
