import { ipcMain } from 'electron'
import { mastra } from './mastra'
import { getModel } from './model'
export default function () {
    let controller: AbortController | null = null;
    ipcMain.handle('agent_chat', async (event, option) => {
        let count = 0
        if (option === false && controller) {
            controller.abort()
            return
        }
        controller = new AbortController()
        const wc = event.sender
        const model = await getModel()
        if (!model) {
            throw new Error('No model found')
        }

        const workflow = mastra.getWorkflowById('page-workflow')
        const agent = mastra.getAgentById('page-agent')
        agent.__updateModel({ model })
        async function streamCall() {
            const { message, currentProperty, pageDesignData } = option
            console.log('currentProperty',currentProperty)
            
            const stream = await agent.stream(message, {
                abortSignal: controller?.signal,
                onFinish: () => {
                    wc.send('llm:finished')
                },
                onChunk: (chunk) => {
                    wc.send('llm:streaming', chunk)
                },
                onError: ({ error }: { error: any }) => {
                    count++
                    if (count < 5) {
                        streamCall()
                        return
                    }
                    const errStr = error?.data?.error?.message
                    const msg = typeof errStr === 'string' ? errStr : JSON.stringify(error)
                    wc.send('llm:error', msg)
                },
                onAbort: () => {
                    wc.send('llm:abort')
                },

            })
            const full = await stream.getFullOutput()
            wc.send('llm:full', full)

        }
        streamCall()

    })
}