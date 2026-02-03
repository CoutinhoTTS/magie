<script setup lang="ts">
import { ProppertyTree } from '@/components/customUI/proppertyTree'
import { ScrollArea } from '@/components/ui/scroll-area'
import useProperty from '@/lib/useProperty'

const property = useProperty()
</script>

<template>
  <div class=" w-full h-full overflow-hidden flex flex-col box-border">
    <template v-if="property?.currentProperty">
      <div class=" w-full text-ml font-bold p-2 box-border border-b select-none">
        {{ property?.currentProperty?.tagName || '' }}
      </div>
      <div class=" w-full flex-1 overflow-hidden">
        <div class="p-2 w-full h-full overflow-hidden rounded-xl">
          <ScrollArea class=" h-full rounded-xl">
            <div class=" w-full bg-[#F7F7F7] rounded-xl px-2">
              <ProppertyTree />
            </div>
          </ScrollArea>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
  :deep(input.h-9){
    height: calc(var(--spacing) * 7);
  }
</style>
