import { eq } from 'drizzle-orm'
import db from '../db'
import * as schema from '../schema'

export async function getPageData(_event: any, { id }: { id: string }) {
  const pages = await db
    .select()
    .from(schema.pages)
    .where(eq(schema.pages.project_id, Number(id)))

  if (pages.length === 0) {
    return {
      id: null,
      name: '',
      tagId: 'design-board',
      children: [],
    }
  }

  return {
    id: pages[0].id,
    name: pages[0].name,
    tagId: pages[0].tag_id,
    children: pages[0].content as any,
  }
}
