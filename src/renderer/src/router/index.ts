import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'project',
    component: () => import('@/views/project/index.vue'),
  },
  {
    path: '/views',
    name: 'views',
    component: () => import('@/views/pages/index.vue'),
    meta: {
      title: 'PAGE LIST',
    },
  },
  {
    path: '/design',
    name: 'design',
    component: () => import('@/views/design/index.vue'),
    meta: {
      title: 'PAGE DESIGN',
    },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
