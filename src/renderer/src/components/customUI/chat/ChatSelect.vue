<script lang="ts" setup>
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class=" absolute inset-0 z-10 ">
    <!-- 遮罩层 -->
    <div class=" absolute inset-0 bg-black opacity-30" />
    <div class=" absolute pt-4 px-4 pb-8 bg-white rounded-t-2xl w-full bottom-0 left-0 right-0">
      <p class=" text-sm text-gray-600 mb-3">
        是否应用 AI 的修改？
      </p>
      <div class=" flex flex-col gap-3">
        <Button variant="outline">
          拒绝
        </Button>
        <Button>
          同意
        </Button>
      </div>
    </div>
  </div>
</template>
