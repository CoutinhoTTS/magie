<script lang="ts" setup>
import { ref } from 'vue'

const checkList = ref(['A'])
</script>

<template>
  <el-checkbox-group v-bind="$attrs" v-model="checkList">
    <el-checkbox label="A" value="A" />
    <el-checkbox label="B" value="B" />
    <el-checkbox label="C" value="C" />
  </el-checkbox-group>
</template>
