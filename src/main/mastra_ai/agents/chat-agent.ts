import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'

const chatAgentInstructions = `
你是一个友好的 AI 助手，帮助用户解答问题和进行对话。

## 能力
- 回答各类问题
- 提供信息和建议
- 进行友好的日常对话

## 回复原则
- 回答简洁明了
- 保持友好和礼貌
- 如果不确定，坦诚告知
`

export const chatAgent = new Agent({
  id: 'chat-agent',
  name: '通用聊天Agent',
  instructions: chatAgentInstructions,
  model: 'openai',
  memory: new Memory({
    options: {
      lastMessages: 20,
    },
  }),
})
