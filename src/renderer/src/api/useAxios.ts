import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import useModel from '@/lib/useModel'

// 从环境变量获取 API baseURL
const env = import.meta.env
const baseURL = env.DEV ? '/api' : ''

const instance = axios.create({
  baseURL,
})

// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const model = useModel()
    // 获取当前选中的模型配置
    const currentModel = model?.currentModel
    if (currentModel) {
      // 将模型信息添加到请求头，由后端根据 compatible_type 处理
      config.headers = config.headers || {}
      config.headers['X-Model-Name'] = currentModel.name
      config.headers['X-Model-API-Key'] = currentModel.api_key
      config.headers['X-Model-URL'] = currentModel.url
      config.headers['X-Model-Type'] = currentModel.compatible_type
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    // 可以在这里统一处理错误
    console.error('API Error:', error)
    return Promise.reject(error)
  },
)
// 统一的 API 响应类型
export interface ApiResponse<T = any> {
  status: boolean
  message?: string
  data?: T
}

export function post<T = any>(path: string, param?: Record<string, any>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    instance.post(path, param ?? {}).then((res: AxiosResponse<T>) => {
      resolve(res.data)
    }).catch((err: AxiosError) => {
      reject(err)
    })
  })
}

// SSE 请求函数，用于 /chat 接口
export function streamChat(
  param?: Record<string, any>,
  onMessage?: (data: string) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void,
): () => void {
  const model = useModel()
  const currentModel = model?.currentModel

  // 准备请求头
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (currentModel) {
    headers['X-Model-Name'] = currentModel.name
    headers['X-Model-API-Key'] = currentModel.api_key
    headers['X-Model-URL'] = currentModel.url
    headers['X-Model-Type'] = currentModel.compatible_type
  }

  let abortController: AbortController | null = new AbortController()

  fetch(`${baseURL}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(param ?? {}),
    signal: abortController.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) {
        throw new Error('Response body is null')
      }
      try {
        while (true) {
          const { done, value } = await reader.read()

          const str = decoder.decode(value, { stream: true })
          onMessage?.(str)
          if (done) {
            onComplete?.()
            break
          }
        }
      }
      catch (error) {
        console.error('Failed to read stream:', error)
        onError?.(error as Error)
      }
    })
    .catch((error) => {
      if (error.name !== 'AbortError') {
        console.error('Stream request failed:', error)
        onError?.(error)
      }
    })

  // 返回清理函数
  return () => {
    abortController?.abort()
    abortController = null
  }
}
