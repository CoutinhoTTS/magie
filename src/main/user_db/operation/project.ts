import type { ResultType } from '../../utils/result'
import type { ProjectNode } from '~/types'
import db from '../db'
import Result from '../../utils/result'
import * as schema from '../schema'

export async function getProjects(): Promise<ResultType<ProjectNode[]>> {
  const result = new Result<ProjectNode[]>()
  let buildTree: ProjectNode[] = []
  let error: string = ''
  let status = true
  try {
    const projects = await db.select().from(schema.projects).orderBy(schema.projects.sort_order)
    const buildTreeFn = (parentId: number | null = null): ProjectNode[] => {
      return projects
        ?.filter?.(p => p.parent_id === parentId)
        ?.map?.(p => ({
          id: p.id,
          name: p.name,
          icon: p.icon,
          parent_id: p.parent_id,
          sort_order: p.sort_order,
          children: buildTreeFn(p.id),
        })) || []
    }
    buildTree = buildTreeFn()
  }
  catch (err: any) {
    status = false
    error = JSON.stringify(err)
  }
  return result.toJSON({
    status,
    data: status ? buildTree : null,
    message: status ? 'sussess' : error,
  })
}

export async function setProjectNode(_event: any, { node }: { node: ProjectNode }) {
  const values = {
    ...(node.id && { id: node.id }),
    name: node.name,
    icon: node.icon,
    parent_id: node.parent_id,
    sort_order: node.sort_order,
  }

  const { id, ...setData } = values

  await db.insert(schema.projects)
    .values(values)
    .onConflictDoUpdate({
      target: schema.projects.id,
      set: setData,
    })

  return await getProjects()
}
