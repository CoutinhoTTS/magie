import { Agent } from '@mastra/core/agent'
import { intentClassifierInstructions } from '../prompts'

export const intentClassifierAgent = new Agent({
  id: 'intent-classifier-agent',
  name: '意图分类Agent',
  instructions: {
    role: 'system',
    content: intentClassifierInstructions,
    providerOptions: {
      zhipuai: { thinking: { type: 'disabled' } },
    },
  },
  model: 'zhipuai',
})
