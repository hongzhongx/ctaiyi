import type { Client } from './client'
import { bytesToHex } from '@noble/hashes/utils'
import defu from 'defu'
import { ClientHTTPError, ClientMessageError, ClientWebSocketError } from './errors'
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

/**
 * WebSocket 传输层
 */
export class WebSocketTransport extends EventTarget {
  private socket?: WebSocket
  private connectPromise: Promise<void> | null = null
  private active = false
  private failureCount = 0

  readonly retryOptions: Required<RetryOptions>
  readonly client: Client
  constructor(
    client: Client,
    options: RetryOptions = {},
  ) {
    super()
    this.retryOptions = defu(options, defaultRetryOptions)
    this.client = client
  }

  public isConnected = (): boolean => {
    return this.socket !== undefined && this.socket.readyState === WebSocket.OPEN
  }

  public connect = async (): Promise<void> => {
    this.active = true

    if (!this.socket) {
      this.socket = new WebSocket(this.client.url)
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
    }
  }

  public async send<T>(request: RPCRequest): Promise<T> {
    if (!this.isConnected()) {
      throw new Error('Not connected')
    }
    if (this.isConnected()) {
      this.write(request).catch((error: Error) => {
        this.rpcHandler(request.id, error)
      })
    }
    const { promise, signal } = this.client.pending.get(request.id)!

    if (signal) {
      signal.onabort = () => {
        const error = new Error(`Timed out after ${this.client.sendTimeout}ms`)
        error.name = 'TimeoutError'
        this.rpcHandler(request.id, error)
      }
    }

    return promise
  }

  private rpcHandler = (seq: number, error?: Error, response?: any) => {
    if (this.client.pending.has(seq)) {
      const { resolve, reject, signal } = this.client.pending.get(seq) as PendingRequest
      if (signal) {
        signal.onabort = null
      }
      this.client.pending.delete(seq)
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
    const toSend: PendingRequest[] = Array.from(this.client.pending.values())
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
          throw normalizeRpcError(response.error)
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
    this.dispatchEvent(new Event('open'))
  }

  private onClose = () => {
    this.socket = undefined
    if (this.active) {
      setTimeout(this.retryHandler, this.retryOptions.backoff(this.failureCount++))
    }
    this.dispatchEvent(new Event('close'))
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
export class HTTPTransport {
  constructor(private readonly client: Client) {
  }

  public async send<T>(request: RPCRequest): Promise<T> {
    try {
      const body = JSON.stringify(request, (key, value) => {
        if (value instanceof Uint8Array) {
          return bytesToHex(value)
        }
        return value
      })
      const response = await fetch(this.client.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
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
      throw new ClientHTTPError('HTTP request failed', { cause: error })
    }
  }
}
