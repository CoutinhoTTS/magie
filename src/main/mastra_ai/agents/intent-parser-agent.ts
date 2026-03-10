import { Agent } from '@mastra/core/agent'
import { intentParserInstructions } from '../prompts'

export const intentParserAgent = new Agent({
  id: 'intent-parser-agent',
  name: '意图解析Agent',
  instructions: {
    role: 'system',
    content: intentParserInstructions,
    providerOptions: {
      zhipuai: { thinking: { type: 'disabled' } },
    },
  },
  model: 'zhipuai',
})
