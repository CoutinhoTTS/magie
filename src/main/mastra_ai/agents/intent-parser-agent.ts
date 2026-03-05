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
  model: {
    url: 'https://open.bigmodel.cn/api/paas/v4',
    id: 'zhipuai/glm-4.7-flash',
    apiKey: '12947a35a3f043ea8c139a5850a0425d.cmvr2b41etQWTke4',
  },
})
