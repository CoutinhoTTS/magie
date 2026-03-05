<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
</script>

<template>
  <el-date-picker v-bind="$attrs" v-model="value" style="width: 100%;" />
</template>
