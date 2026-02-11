export interface Option<T> {
  status: boolean
  data: T | null
  message: string
}

// 导出 Result 的 JSON 序列化类型
export type ResultType<T> = Option<T>
export default class Result<T = any> {
  private status: boolean = true
  private data: T | null = null
  private message: string = ''

  constructor(option?: Option<T>) {
    this.status = option?.status || true
    this.data = option?.data || null
    this.message = option?.message || ''
  }

  getStatus(): Option<T>['status'] {
    return this.status
  }

  getData(): Option<T>['data'] | null {
    return this.data
  }

  getMessage(): Option<T>['message'] {
    return this.message
  }

  toJSON(option?: Option<T>): Option<T> {
    return {
      status: option?.status || this.status,
      data: option?.data || this.data,
      message: option?.message || this.message,
    }
  }
}
