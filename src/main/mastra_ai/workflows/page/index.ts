import { createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'
import step1CheckProperty from './steps/step1.checkCurrentProperty'
import step2LocateTargetProperty from './steps/step2.locateTargetProperty'
import step3ModifyProperty from './steps/step3.modifyProperty'

export const DefaultInputSchema = z.object({
  option: z.object({
    message: z.string(),
    currentProperty: z.any(),
  }),
})
const pageWorkflow = createWorkflow({
  id: 'page-workflow',
  inputSchema: DefaultInputSchema,
  outputSchema: z.object({
    requirements: z.string(),
    patch: z.array(z.object({
      prop: z.string(),
      oldValue: z.any(),
      newValue: z.any(),
      reason: z.string().optional(),
    })),
    summary: z.string(),
  }),
})
  .then(step1CheckProperty)
  .then(step2LocateTargetProperty)
  .then(step3ModifyProperty)
  .commit()

export { pageWorkflow }
