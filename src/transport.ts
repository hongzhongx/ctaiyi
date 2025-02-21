import { bytesToHex } from '@noble/hashes/utils'
import defu from 'defu'
import { ClientHTTPError, ClientMessageError, ClientTimeoutError, ClientWebSocketError } from './errors'
import { normalizeRpcError, waitForEvent } from './utils'

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

const defaultRetryOptions: Required<RetryOptions> = {
  retry: 3,
  backoff: defaultBackoff,
}

function defaultBackoff(failureCount: number): number {
  return Math.min((failureCount * 10) ** 2, 10 * 1000)
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

export interface HTTPTransportConfig extends TransportConfig { }

export interface WebSocketTransportConfig extends TransportConfig {

  /**
   * 自动连接
   * @default true
   */
  autoConnect?: boolean

  retry?: number | ((failureCount: number, error: Error) => boolean) | RetryOptions
}

/**
 * WebSocket 传输层
 */
export class WebSocketTransport extends EventTarget implements Transport {
  readonly type = 'websocket'
  readonly timeout: number

  private socket?: WebSocket
  private connectPromise: Promise<void> | null = null
  private active = false
  private failureCount = 0
  private readonly pending = new Map<number, PendingRequest>()

  readonly retryOptions: Required<RetryOptions>

  constructor(
    public url: string,
    config: WebSocketTransportConfig = {},
  ) {
    super()
    this.timeout = config.timeout ?? 14000
    this.retryOptions = defu(config.retry, defaultRetryOptions)

    if (config.autoConnect) {
      this.connect()
    }
  }

  public isConnected = (): boolean => {
    return this.socket !== undefined && this.socket.readyState === WebSocket.OPEN
  }

  public connect = (): Promise<void> => {
    this.active = true

    if (!this.socket) {
      this.socket = new WebSocket(this.url)
      this.socket.addEventListener('message', this.onMessage)
      this.socket.addEventListener('open', this.onOpen)
      this.socket.addEventListener('close', this.onClose)
      this.socket.addEventListener('error', this.errorEventHandler)
    }

    if (this.connectPromise === null) {
      this.connectPromise = new Promise((resolve, reject) => {
        const done = () => {
          this.removeEventListener('open', done)
          this.removeEventListener('close', done)
          resolve()
        }
        const onError = () => {
          reject(new Error('failed to connect'))
        }
        this.addEventListener('open', done)
        this.addEventListener('close', done)
        this.addEventListener('error', onError)
      })
    }
    return this.connectPromise
  }

  public disconnect = async (): Promise<void> => {
    this.active = false

    if (
      this.socket
      && this.socket.readyState !== WebSocket.CLOSED
      && this.socket.readyState !== WebSocket.CLOSING
    ) {
      this.socket.close()
      await waitForEvent(this, 'close')
      this.socket = undefined
      this.connectPromise = null
    }
  }

  public async send<T>(request: RPCRequest): Promise<T> {
    let signal: AbortSignal | undefined
    if (this.timeout > 0) {
      signal = AbortSignal.timeout(this.timeout)
    }

    const { promise, reject, resolve } = Promise.withResolvers<T>()
    this.pending.set(request.id, { promise, request, resolve, reject, signal })

    if (this.isConnected()) {
      this.write(request).catch((error: Error) => {
        this.rpcHandler(request.id, error)
      })
    }

    if (signal) {
      signal.onabort = () => {
        const error = new ClientTimeoutError(`Timed out after ${this.timeout}ms`)
        this.rpcHandler(request.id, error)
      }
    }

    return promise
  }

  private rpcHandler = (seq: number, error?: Error, response?: any) => {
    if (this.pending.has(seq)) {
      const { resolve, reject, signal } = this.pending.get(seq) as PendingRequest
      if (signal) {
        signal.onabort = null
      }
      this.pending.delete(seq)
      if (error) {
        reject(error)
      }
      else {
        resolve(response)
      }
    }
  }

  private write = async (request: RPCRequest) => {
    const data = JSON.stringify(request, (key, value) => {
      if (value instanceof Uint8Array) {
        return bytesToHex(value)
      }
      return value
    })

    this.socket!.send(data)
  }

  private flushPending = () => {
    const toSend: PendingRequest[] = Array.from(this.pending.values())
    toSend.sort((a, b) => a.request.id - b.request.id)
    toSend.map(async (pending) => {
      try {
        await this.write(pending.request)
      }
      catch (error) {
        this.rpcHandler(pending.request.id, error as Error)
      }
    })
  }

  override addEventListener(
    type: 'open' | 'close',
    callback: (() => void) | { handleEvent: () => void } | null,
    options?: AddEventListenerOptions | boolean
  ): void
  override addEventListener(
    type: 'error',
    callback: ((e: ErrorEvent) => void) | { handleEvent: (e: ErrorEvent) => void } | null,
    options?: AddEventListenerOptions | boolean
  ): void
  override addEventListener(
    type: 'notice',
    callback: ((e: CustomEvent) => void) | { handleEvent: (e: CustomEvent) => void } | null,
    options?: AddEventListenerOptions | boolean
  ): void
  override addEventListener(
    type: 'notice' | 'error' | 'open' | 'close',
    callback: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void {
    super.addEventListener(type, callback, options)
  }

  private onMessage = (event: MessageEvent) => {
    if (event instanceof MessageEvent) {
      try {
        const rpcMessage = JSON.parse(event.data)
        if (rpcMessage.method && rpcMessage.method === 'notice') {
          const ev = new CustomEvent('notice', { detail: rpcMessage.params })
          this.dispatchEvent(ev)
          return
        }
        const response = rpcMessage as RPCResponse
        let error: Error | undefined
        if (response.error) {
          error = new ClientWebSocketError('WebSocket request error', { cause: normalizeRpcError(response.error) })
        }
        this.rpcHandler(response.id, error, response.result)
      }
      catch (cause) {
        const error = new ClientMessageError('got invalid message', { cause })
        this.dispatchEvent(new CustomEvent('error', { detail: error }))
      }
    }
    else {
      throw new TypeError('unexpected event type')
    }
  }

  private onOpen = () => {
    this.failureCount = 0
    this.flushPending()
    this.dispatchEvent(new CustomEvent('open'))
  }

  private onClose = () => {
    this.socket = undefined
    if (this.active) {
      setTimeout(this.retryHandler, this.retryOptions.backoff(this.failureCount++))
    }
    this.dispatchEvent(new CustomEvent('close'))
  }

  private errorEventHandler = (e: Event) => {
    const error = new ClientWebSocketError('WebSocket error', { cause: e })
    this.dispatchEvent(new CustomEvent('error', { detail: error }))
  }

  private retryHandler = () => {
    if (this.active) {
      this.connect()
    }
  }
}

/**
 * HTTP 传输层
 */
export class HTTPTransport implements Transport {
  readonly type = 'http'
  readonly timeout: number
  private readonly pending = new Map<number, PendingRequest>()

  constructor(
    public url: string,
    config: HTTPTransportConfig = {},
  ) {
    this.timeout = config.timeout ?? 14000
  }

  public async send<T>(request: RPCRequest): Promise<T> {
    try {
      let signal: AbortSignal | undefined
      if (this.timeout > 0) {
        signal = AbortSignal.timeout(this.timeout)
      }

      const { promise, reject, resolve } = Promise.withResolvers<T>()
      this.pending.set(request.id, { promise, request, resolve, reject, signal })

      const body = JSON.stringify(request, (key, value) => {
        if (value instanceof Uint8Array) {
          return bytesToHex(value)
        }
        return value
      })
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
        signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const rpcResponse = await response.json() as RPCResponse

      if (rpcResponse.error) {
        throw normalizeRpcError(rpcResponse.error)
      }

      return rpcResponse.result
    }
    catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ClientTimeoutError(`Timed out after ${this.timeout}ms`)
      }
      else {
        throw new ClientHTTPError('HTTP request failed', { cause: error })
      }
    }
  }
}

export function http(url: string, config?: HTTPTransportConfig): HTTPTransport {
  return new HTTPTransport(url, config)
}

export function webSocket(url: string, config?: WebSocketTransportConfig): WebSocketTransport {
  return new WebSocketTransport(url, config)
}
