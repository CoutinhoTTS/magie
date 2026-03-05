import type { Agent } from '@mastra/core/agent'
import type { MastraModelConfig } from '@mastra/core/llm'
import type { WebContents } from 'electron'
import type * as agents from '../agents'
import type ContextRuntime from './contextRuntime'
import { mastra } from '~/main/mastra_ai/mastra'
import { getSelectedModel } from '~/main/user_db/operation/model'

type AgentKey = keyof typeof agents
type AgentID = 'page-agent' | 'chat-agent' | 'keyword-extractor-agent' | 'intent-classifier-agent'
export default class {
  private agentGroup: Partial<Record<AgentKey, Agent | null>> = {
    pageAgent: null,
    chatAgent: null,
    keywordExtractorAgent: null,
    intentClassifierAgent: null,
  }

  private wc: WebContents | null = null
  private context: ContextRuntime
  constructor(context: ContextRuntime) {
    this.agentGroup.pageAgent = mastra.getAgentById('page-agent')
    this.agentGroup.chatAgent = mastra.getAgentById('chat-agent')
    this.agentGroup.keywordExtractorAgent = mastra.getAgentById('keyword-extractor-agent')
    this.agentGroup.intentClassifierAgent = mastra.getAgentById('intent-classifier-agent')
    this.wc = context.getCurrentWc()
    this.context = context
  }

  async getModel(): Promise<MastraModelConfig | undefined> {
    const { data } = await getSelectedModel()
    if (data) {
      return {
        id: `${data?.compatible_type}/${data?.name}`,
        url: data.url,
        apiKey: data.api_key,
      }
    }
    return void 0
  }

  async setModel(value?: MastraModelConfig) {
    let model = value
    if (!model) {
      model = await this.getModel()
      if (!model)
        throw new Error('Model not found')
    }
    this.agentGroup.pageAgent?.__updateModel?.({ model })
    this.agentGroup.chatAgent?.__updateModel?.({ model })
    this.agentGroup.keywordExtractorAgent?.__updateModel?.({ model })
    this.agentGroup.intentClassifierAgent?.__updateModel?.({ model })
  }

  getAgent(keyName: AgentKey) {
    return this.agentGroup?.[keyName] ?? null
  }

  agentStream(params: {
    agent?: Agent
    agentID?: AgentID
    agentKey?: AgentKey
    message: string
    streamOption?: Record<string, any>
  }) {
    const { agent, agentID, agentKey, message, streamOption } = params
    const agentInstance = agent || mastra.getAgentById(agentID || 'chat-agent') || this.agentGroup[agentKey || 'chatAgent']
    const option = Object.assign({}, {
      providerOptions: {
        zhipuai: { thinking: { type: 'disabled' } },
      },
      onChunk: (chunk: any) => {
        this.wc?.send?.('llm:streaming', chunk)
      },
      onFinish: () => {
        this.wc?.send?.('llm:finished')
      },
      onError: ({ error }: { error: any }) => {
        this.wc?.send('llm:error', error)
      },
      abortSignal: this.context.signal,
    }, streamOption || {})
    return agentInstance.stream(message, option)
  }
}
