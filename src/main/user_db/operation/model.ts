import type { ResultType } from '../../utils/result'
import type { ModelItem } from '~/types'
import { eq } from 'drizzle-orm'
import db from '../db'
import Result from '../../utils/result'
import * as schema from '../schema'

export async function getAllModels(): Promise<ResultType<ModelItem[]>> {
  const result = new Result<ModelItem[]>()
  let models: ModelItem[] = []
  let status = true
  let error = ''
  try {
    models = await db.select().from(schema.models)
    models = models.map(m => ({
      id: m.id,
      name: m.name,
      url: m.url,
      compatible_type: m.compatible_type,
      api_key: m.api_key,
      selected: m.selected,
    }))
  }
  catch (err: any) {
    status = false
    error = JSON.stringify(err)
  }
  return result.toJSON({
    status,
    data: status ? models : null,
    message: error,
  })
}

export async function getSelectedModel(): Promise<ResultType<ModelItem>> {
  const result = new Result<ModelItem>()
  let model: ModelItem | null = null;
  let status = true
  let error = ''
  try {
    const models = await db.select().from(schema.models).where(({ selected }) => eq(selected, true))
    model = models
      ?.filter
      ?.((_, i) => i == 0)
      ?.map
      ?.(m => ({
        id: m.id,
        name: m.name,
        url: m.url,
        compatible_type: m.compatible_type,
        api_key: m.api_key,
        selected: m.selected,
      }))
      ?.[0] ?? null
  }
  catch (err: any) {
    status = false
    error = JSON.stringify(err)
  }
  return result.toJSON({
    status,
    data: status ? model : null,
    message: error,
  })
}



export async function setModelValue(_event: any, { model }: { model: ModelItem }): Promise<ResultType<ModelItem>> {
  const result = new Result<ModelItem>()
  let status = true
  let message = 'success'
  let savedModel: ModelItem | null = null

  try {
    if (model.selected) {
      await db.update(schema.models).set({ selected: false })
    }

    const data = {
      name: model.name,
      url: model.url,
      compatible_type: model.compatible_type,
      api_key: model.api_key,
      selected: model.selected ?? false,
    }

    const values = {
      ...(model.id && { id: model.id }),
      ...data,
    }

    // 去掉 id 字段，用于 update 时使用
    const { id, ...setData } = values;
    ([savedModel] = await db.insert(schema.models)
      .values(values)
      .onConflictDoUpdate({
        target: schema.models.id,
        set: setData,
      })
      .returning())

    // 如果只有一个 model，自动将其设为 selected
    const allModels = await db.select().from(schema.models)
    if (allModels.length === 1) {
      await db.update(schema.models).set({ selected: true }).where(eq(schema.models.id, allModels[0].id))
    }
  }
  catch (err: any) {
    status = false
    message = JSON.stringify(err)
  }
  return result.toJSON({
    status,
    data: status ? savedModel : null,
    message,
  })
}
