import { createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'




const pageWorkflow = createWorkflow({
  id: 'page-workflow',
  inputSchema: z.object({
    currentProperty: z.any().optional(),
    instruction: z.string(),
    agent: z.any(),
  }),
  outputSchema: z.object({
    patch: z.array(z.object({
      prop: z.string(),
      oldValue: z.any(),
      newValue: z.any(),
    }))
  }),
})

  .commit()

export { pageWorkflow }
