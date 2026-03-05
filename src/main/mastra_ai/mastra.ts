import { Mastra } from '@mastra/core/mastra'
import { LibSQLStore } from '@mastra/libsql'
import { PinoLogger } from '@mastra/loggers'
import { CloudExporter, DefaultExporter, Observability, SensitiveDataFilter } from '@mastra/observability'
import { app } from 'electron'
import { chatAgent } from './agents/chat-agent'
import { intentClassifierAgent } from './agents/intent-classifier-agent'
import { intentParserAgent } from './agents/intent-parser-agent'
import { keywordExtractorAgent } from './agents/keyword-extractor-agent'
import { pageAgent } from './agents/page-agent'
import { chatWorkflow } from './workflows/chat'
import { gatewayWorkflow } from './workflows/gateway'
import { pageWorkflow } from './workflows/page'

const userDataPath = app.getPath('userData')

export const mastra = new Mastra({
  workflows: { gatewayWorkflow, chatWorkflow, pageWorkflow },
  agents: { pageAgent, intentClassifierAgent, chatAgent, intentParserAgent, keywordExtractorAgent },
  storage: new LibSQLStore({
    id: 'mastra-storage',
    // 存储可观测性、评分等数据
    // :memory: 表示内存存储，重启后数据丢失
    // 如需持久化，使用 file:../mastra.db
    url: `file:${userDataPath}/mastra.db`,
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra',
        exporters: [
          new DefaultExporter(), // 将 traces 持久化到存储，供 Mastra Studio 使用
          new CloudExporter(), // 发送 traces 到 Mastra Cloud (需要设置 MASTRA_CLOUD_ACCESS_TOKEN)
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(), // 过滤敏感数据如密码、tokens、keys
        ],
      },
    },
  }),
})
