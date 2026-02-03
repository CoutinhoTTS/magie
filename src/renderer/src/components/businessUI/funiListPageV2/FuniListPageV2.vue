<script setup lang="tsx">
import { computed } from 'vue'

const useCardTab = computed(() => {
  return [
    {
      label: 'tab01',
      curdOption: {
        btns: [
          {
            component: () => (
              <el-button type="primary">
                新建
              </el-button>
            ),
          },
        ],
        lodaData: () => {
          return new Promise((resolve, reject) => {
            const list = [
              {
                data001: '数据001',
                data002: '数据002',
                data003: '数据003',
                data004: '数据004',
                data005: '数据005',
                data006: '数据006',
                data007: '数据007',
              },
            ]
            setTimeout(() => {
              if (list) {
                resolve({
                  list,
                  total: 3,
                })
              }
              else {
                reject(new Error('获取数据失败'))
              }
            })
          })
        },
        fixedButtons: true,
        reloadOnActive: true,
        checkOnRowClick: true,
        useSearchV2: true,
        columns: [
          {
            label: '表头001',
            prop: 'data001',
          },
          {
            label: '表头002',
            prop: 'data002',
          },
          {
            label: '表头003',
            prop: 'data003',
          },
          {
            label: '表头004',
            prop: 'data004',
          },
          {
            label: '表头005',
            prop: 'data005',
          },
          {
            label: '表头006',
            prop: 'data006',
          },
          {
            label: '表头007',
            prop: 'data007',
          },
        ],
      },
    },
    {
      label: 'tab02',
      curdOption: {
        btns: [
          {
            component: () => (
              <el-button type="primary">
                新建
              </el-button>
            ),
          },
        ],
        lodaData: () => {
          return new Promise((resolve, reject) => {
            const list = [
              {
                data001: '数据001',
                data002: '数据002',
                data003: '数据003',
                data004: '数据004',
                data005: '数据005',
                data006: '数据006',
                data007: '数据007',
              },
            ]
            setTimeout(() => {
              if (list) {
                resolve({
                  list,
                  total: 3,
                })
              }
              else {
                reject(new Error('获取数据失败'))
              }
            })
          })
        },
        fixedButtons: true,
        reloadOnActive: true,
        checkOnRowClick: true,
        useSearchV2: true,
        columns: [
          {
            label: '表头001',
            prop: 'data001',
          },
          {
            label: '表头002',
            prop: 'data002',
          },
          {
            label: '表头003',
            prop: 'data003',
          },
          {
            label: '表头004',
            prop: 'data004',
          },
          {
            label: '表头005',
            prop: 'data005',
          },
          {
            label: '表头006',
            prop: 'data006',
          },
          {
            label: '表头007',
            prop: 'data007',
          },
        ],
      },
    },
  ]
})
</script>

<template>
  <div class=" w-[600px]">
    <FuniListPageV2 :card-tab="useCardTab" />
  </div>
</template>

<style scoped></style>
