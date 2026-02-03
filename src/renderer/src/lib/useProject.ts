import type { ProjectNode, ResultType } from '~/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const invoke = window.api.invoke

export default defineStore('project', () => {
  const projectList = ref<Array<ProjectNode>>([])
  const addMode = ref(false)
  const parentId = ref<number | null>(null)
  async function getProjectList() {
    const result = await invoke<ResultType<ProjectNode[]>>('get_projects')
    if (result.status && result.data) {
      projectList.value = result.data
    }
  }
  function traverse(nodes: ProjectNode[], callback: (node: ProjectNode) => void) {
    nodes.forEach((node) => {
      callback(node)
      if (node.children && node.children.length > 0) {
        traverse(node.children, callback)
      }
    })
  }

  function flattenNodes(nodes: ProjectNode[]) {
    const result: ProjectNode[] = []
    traverse(nodes, node => result.push(node))
    return result
  }

  function addProject(id: number | null = null) {
    parentId.value = id
    addMode.value = true
  }
  function savedProject() {
    parentId.value = null
    addMode.value = false
  }

  return { getProjectList, projectList, flattenNodes, addProject, addMode, savedProject, parentId }
})
