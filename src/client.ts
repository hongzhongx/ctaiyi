import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import defu from 'defu'
import invariant from 'tiny-invariant'
import { version } from '../package.json' with { type: 'json' }
import { BaiYuJingAPI } from './helpers/baiyujing'
import { Blockchain } from './helpers/blockchain'
import { BroadcastAPI } from './helpers/broadcast'
import { waitForEvent } from './utils'

/**
 * 包版本
 */
export const VERSION = version

/**
 * 主网链ID
 */
export const DEFAULT_CHAIN_ID = hexToBytes('0000000000000000000000000000000000000000000000000000000000000000')

/**
 * 地址前缀
 */
export const DEFAULT_ADDRESS_PREFIX = 'TAI'

interface RPCRequest {
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

interface RPCCall extends RPCRequest {
  method: 'call'
  /**
   * 1. 要调用的API,你可以传入通过调用'get_api_by_name'获得的API数字ID,
   *    或者直接传入API名称字符串。
   * 2. 要在该API上调用的方法。
   * 3. 传递给该方法的参数。
   */
  params: [number | string, string, any[]]
}

interface RPCError {
  code: number
  message: string
  data?: any
}

interface RPCResponse {
  /**
   * 响应序列号,对应请求序列号
   */
  id: number
  error?: RPCError
  result?: any
}

interface PendingRequest {
  request: RPCRequest
  /**
   * 超时 AbortSignal
   */
  signal?: AbortSignal
  resolve: (response: any) => void
  reject: (error: Error) => void
}

export interface RetryOptions {
  retry?: number | ((failureCount: number, error: Error) => boolean)
  backoff?: (failureCount: number) => number
}

export interface ClientOptions {
  /**
   * 链ID
   */
  chainId?: string
  /**
   * 地址前缀
   * @default 'TAI'
   */
  addressPrefix?: string

  /**
   * 自动连接
   * @default true
   */
  autoConnect?: boolean

  /**
   * 请求超时，单位：毫秒
   * @default 14000
   */
  timeout?: number

  retry?: number | ((failureCount: number, error: Error) => boolean) | RetryOptions
}

const defaultRetryOptions: Required<RetryOptions> = {
  retry: 3,
  backoff: defaultBackoff,
}

/**
 * 消息错误
 */
export class ClientMessageError extends Error {
  override name = 'MessageError'
  constructor(message: string, init?: ErrorOptions) {
    super(message, init)
  }
}

/**
 * WebSocket 通用错误
 */
export class ClientWebSocketError extends Error {
  override name = 'WebSocketError'
  constructor(message: string, init?: ErrorOptions) {
    super(message, init)
  }
}

// MARK: Client
/**
 * RPC client
 */
export class Client extends EventTarget {
  /**
   * 创建测试网客户端
   * @param options 客户端选项
   * @returns 测试网客户端实例
   */
  public static testnet(options?: ClientOptions) {
    const opts: ClientOptions = defu(options, {
      addressPrefix: 'TAI',
      chainId: '18dcf0a285365fc58b71f18b3d3fec954aa0c141c44e4e5cb4cf777b9eab274e',
    })
    return new Client('ws://47.109.49.30:8090', opts)
  }

  // #region Client Properties
  public readonly url: string
  public readonly chainId: Uint8Array
  public readonly addressPrefix: string
  public readonly retryOptions: Required<RetryOptions>

  // #region Client Status
  private active = false
  private failureCount = 0
  private socket?: WebSocket
  // #endregion

  // #region Request State
  private seqNo = 0
  private pending = new Map<number, PendingRequest>()
  // #endregion

  private connectPromise: Promise<void> | null = null
  sendTimeout: number
  // #endregion

  // #region Helper
  public readonly baiyujing: BaiYuJingAPI
  public readonly blockchain: Blockchain
  public readonly broadcast: BroadcastAPI
  // #endregion

  constructor(url: string, options: ClientOptions = {}) {
    super()
    this.url = url
    this.chainId = options.chainId ? hexToBytes(options.chainId) : DEFAULT_CHAIN_ID
    invariant(this.chainId.length === 32, 'invalid chain id')
    this.addressPrefix = options.addressPrefix || DEFAULT_ADDRESS_PREFIX

    this.sendTimeout = options.timeout ?? 14 * 1000

    this.baiyujing = new BaiYuJingAPI(this)
    this.blockchain = new Blockchain(this)
    this.broadcast = new BroadcastAPI(this)

    this.retryOptions = defu(typeof options.retry === 'object' ? options.retry : { retry: options.retry }, defaultRetryOptions)
    if (options.autoConnect === undefined || options.autoConnect === true) {
      this.connect()
    }
  }

  public isConnected(): boolean {
    return (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN)
  }

  public connect(): Promise<void> {
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

  public async disconnect(): Promise<void> {
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

  // #region Event Handlers
  private onMessage = (event: MessageEvent) => {
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
        const { data } = response.error
        let { message } = response.error
        if (data && data.stack && data.stack.length > 0) {
          const top = data.stack[0]
          const topData = structuredClone(top.data)
          message = top.format.replace(/\$\{([a-z_]+)\}/gi, (match: string, key: string) => {
            let rv = match
            if (topData[key]) {
              rv = topData[key]
              delete topData[key]
            }
            return rv
          })
          const unformattedData = Object.keys(topData)
            .map(key => ({ key, value: topData[key] }))
            .filter(item => typeof item.value === 'string')
            .map(item => `${item.key}=${item.value}`)
          if (unformattedData.length > 0) {
            message += ` ${unformattedData.join(' ')}`
          }
        }
        error = new Error(message, { cause: data })
        error.name = 'RPCError'
      }
      this.rpcHandler(response.id, error, response.result)
    }
    catch (cause) {
      const error = new ClientMessageError('got invalid message', { cause })

      this.onError(error)
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

  private onError = (error: Error) => {
    const e = new CustomEvent('error', { detail: error })
    this.dispatchEvent(e)
  }

  private errorEventHandler = (e: Event) => {
    const error = new ClientWebSocketError('WebSocket error', { cause: e })
    this.onError(error)
  }
  // #endregion

  private retryHandler = () => {
    if (this.active) {
      this.connect()
    }
  }

  public call<Response = any>(api: string, method: string, params: any[] = []): Promise<Response> {
    const request: RPCCall = {
      id: ++this.seqNo,
      method: 'call',
      params: [api, method, params],
      jsonrpc: '2.0',
    }
    return this.send(request)
  }

  private send<T = any>(request: RPCRequest): Promise<T> {
    let signal: AbortSignal | undefined
    if (this.sendTimeout > 0) {
      signal = AbortSignal.timeout(this.sendTimeout)
      signal.onabort = () => {
        const error = new Error(`Timed out after ${this.sendTimeout}ms`)
        error.name = 'TimeoutError'
        this.rpcHandler(request.id, error)
      }
    }

    const { promise, reject, resolve } = Promise.withResolvers<T>()

    this.pending.set(request.id, { request, resolve, reject, signal })
    if (this.isConnected()) {
      this.write(request).catch((error: Error) => {
        this.rpcHandler(request.id, error)
      })
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
}

function defaultBackoff(failureCount: number): number {
  return Math.min((failureCount * 10) ** 2, 10 * 1000)
}
