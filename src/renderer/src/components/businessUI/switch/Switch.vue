<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(true)
</script>

<template>
  <el-switch v-bind="$attrs" v-model="value" />
</template>
