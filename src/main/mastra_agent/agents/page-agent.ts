import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
// import { pageTool } from '../tools/page-tool'  // Uncomment when tool is ready

export const pageAgent = new Agent({
  id: 'page-agent',
  name: '页面编排Agent',
  instructions: `
    You are a page orchestration assistant that helps users design and build web pages.

    TODO: Add detailed instructions for page orchestration capabilities.
  `,
  model: 'openai',
  memory: new Memory(),
})
