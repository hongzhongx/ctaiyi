export interface RPCRequest {
  /**
   * 请求序列号
   */
  id: number
  /**
   * RPC method.
   */
  method: 'call' | 'notice' | 'callback'
  jsonrpc: '2.0'
  params: any[]
}

export interface RPCCall extends RPCRequest {
  method: 'call'
  /**
   * 1. 要调用的API,你可以传入通过调用'get_api_by_name'获得的API数字ID,
   *    或者直接传入API名称字符串。
   * 2. 要在该API上调用的方法。
   * 3. 传递给该方法的参数。
   */
  params: [number | string, string, any[]]
}

export interface RPCResponseError {
  code: number
  message: string
  data?: any
}

export interface RPCResponse {
  /**
   * 响应序列号,对应请求序列号
   */
  id: number
  error?: RPCResponseError
  result?: any
}

export interface PendingRequest {
  request: RPCRequest
  /**
   * 超时 AbortSignal
   */
  signal?: AbortSignal
  promise: Promise<any>
  resolve: (response: any) => void
  reject: (error: Error) => void
}

export interface RetryOptions {
  retry?: number | ((failureCount: number, error: Error) => boolean)
  backoff?: (failureCount: number) => number
}

export interface Transport {
  readonly type: string
  send: <T>(request: RPCRequest) => Promise<T>
}

export interface TransportConfig {
  /**
   * 请求超时时间（毫秒）
   * @default 14000
   */
  timeout?: number
}
