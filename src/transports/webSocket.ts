import type { PendingRequest, RetryOptions, RPCRequest, RPCResponse, Transport, TransportConfig } from './transport'
import { bytesToHex } from '@noble/hashes/utils'
import defu from 'defu'
import { ClientTimeoutError, ClientWebSocketError } from '../errors'
import { normalizeRpcError, waitForEvent } from '../utils'

export interface WebSocketTransportConfig extends TransportConfig {

  /**
   * 自动连接
   * @default true
   */
  autoConnect?: boolean

  retry?: number | ((failureCount: number, error: Error) => boolean) | RetryOptions
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
    if (!this.isConnected()) {
      await this.connect()
    }
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
        const error = new ClientWebSocketError('WebSocket request error', { cause })
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

export function webSocket(url: string, config?: WebSocketTransportConfig): WebSocketTransport {
  return new WebSocketTransport(url, config)
}
