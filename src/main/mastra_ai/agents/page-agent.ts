import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import { pageAgentInstructions } from '../prompts'

export const pageAgent = new Agent({
  id: 'page-agent',
  name: '页面编排Agent',
  instructions: pageAgentInstructions,
  model: 'openai',
  memory: new Memory({
    options: {
      lastMessages: 10,
    },
  }),
})
