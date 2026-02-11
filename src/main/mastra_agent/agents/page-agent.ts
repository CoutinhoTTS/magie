import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
// import { pageTool } from '../tools/page-tool'  // Uncomment when tool is ready

export const pageAgent = new Agent({
  id: 'page-agent',
  name: '页面编排Agent',
  instructions: `
    
  `,
  model: 'openai',
  memory: new Memory(),
})
