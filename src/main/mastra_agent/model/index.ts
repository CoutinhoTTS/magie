import { getSelectedModel } from '~/main/SQLite/operation/model'
import type { MastraModelConfig } from '@mastra/core/llm'

export async function getModel(): Promise<MastraModelConfig | null> {
    const { data } = await getSelectedModel()
    if (data) {
        return {
            modelId: data?.name,
            providerId: data?.compatible_type,
            url: data.url,
            apiKey: data.api_key
        }
    }
    return null

}