import { Agent } from '@mastra/core/agent'
import { keywordExtractorInstructions } from '../prompts'

export const keywordExtractorAgent = new Agent({
  id: 'keyword-extractor-agent',
  name: '关键词提取Agent',
  instructions: {
    role: 'system',
    content: keywordExtractorInstructions,
    providerOptions: {
      zhipuai: { thinking: { type: 'disabled' } },
    },
  },
  model: 'zhipuai',
})
