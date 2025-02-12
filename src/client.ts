import type { PendingRequest, RetryOptions, RPCCall, RPCRequest } from './transport'
import { hexToBytes } from '@noble/hashes/utils'
import defu from 'defu'
import invariant from 'tiny-invariant'
import { version } from '../package.json' with { type: 'json' }
import { BaiYuJingAPI } from './helpers/baiyujing'
import { Blockchain } from './helpers/blockchain'
import { BroadcastAPI } from './helpers/broadcast'
import { HTTPTransport, WebSocketTransport } from './transport'
import { isWebSocketProtocol } from './utils'

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
}

export interface HTTPClientOptions extends ClientOptions {
  /**
   * 请求超时，单位：毫秒
   * @default 14000
   */
  timeout?: number
}

export interface WebSocketClientOptions extends ClientOptions {

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
  public static testnet(options?: ClientOptions & { url?: string }) {
    const opts: HTTPClientOptions = defu(options, {
      addressPrefix: 'TAI',
      chainId: '18dcf0a285365fc58b71f18b3d3fec954aa0c141c44e4e5cb4cf777b9eab274e',
    })
    const url = options?.url ?? 'http://127.0.0.1:8090'
    return new Client(url as `http://${string}`, opts)
  }

  // #region Client Properties
  public readonly url: string
  public readonly chainId: Uint8Array
  public readonly addressPrefix: string

  public pending = new Map<number, PendingRequest>()
  public seqNo = 0
  private transport: HTTPTransport | WebSocketTransport

  sendTimeout: number

  // #region Helper
  public readonly baiyujing: BaiYuJingAPI
  public readonly blockchain: Blockchain
  public readonly broadcast: BroadcastAPI
  // #endregion

  constructor(url: `http://${string}` | `https://${string}`, options: HTTPClientOptions)
  constructor(url: `ws://${string}` | `wss://${string}`, options: WebSocketClientOptions)
  constructor(url: string, options: WebSocketClientOptions | HTTPClientOptions = {}) {
    super()
    this.url = url
    this.chainId = options.chainId ? hexToBytes(options.chainId) : DEFAULT_CHAIN_ID
    invariant(this.chainId.length === 32, 'invalid chain id')
    this.addressPrefix = options.addressPrefix || DEFAULT_ADDRESS_PREFIX

    this.sendTimeout = options.timeout ?? 14 * 1000

    this.baiyujing = new BaiYuJingAPI(this)
    this.blockchain = new Blockchain(this)
    this.broadcast = new BroadcastAPI(this)

    if (isWebSocketProtocol(url)) {
      const { retry, autoConnect = true } = options as WebSocketClientOptions
      const retryOptions: RetryOptions = typeof retry === 'object' ? retry : { retry }
      this.transport = new WebSocketTransport(this, retryOptions)

      // 绑定事件处理器
      this.transport.addEventListener('message', this.onMessage)
      this.transport.addEventListener('open', this.onOpen)
      this.transport.addEventListener('close', this.onClose)
      this.transport.addEventListener('error', this.onError)

      if (autoConnect) {
        this.connect()
      }
    }
    else {
      this.transport = new HTTPTransport(this)
    }
  }

  public isConnected(): boolean {
    if (this.transport instanceof WebSocketTransport) {
      return this.transport.isConnected()
    }
    console.error('[ctaiyi] isConnected isn\'t for http transport')
    return true
  }

  public connect(): Promise<void> {
    if (this.transport instanceof WebSocketTransport) {
      return this.transport.connect()
    }
    console.error('[ctaiyi] connect isn\'t for http transport')
    return Promise.resolve()
  }

  public async disconnect(): Promise<void> {
    if (this.transport instanceof WebSocketTransport) {
      await this.transport.disconnect()
    }
    console.error('[ctaiyi] disconnect isn\'t for http transport')
  }

  override addEventListener(
    type: 'open' | 'close',
    callback: (() => void) | { handleEvent: () => void } | null,
    options?: AddEventListenerOptions | boolean
  ): void
  override addEventListener(
    type: 'notice' | 'error' | 'open' | 'close',
    callback: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void {
    super.addEventListener(type, callback, options)
  }

  // #region Event Handlers
  private onMessage = (event: Event) => {
    if (event instanceof MessageEvent) {
      this.dispatchEvent(new MessageEvent('message', { data: event.data }))
    }
  }

  private onOpen = () => {
    this.dispatchEvent(new Event('open'))
  }

  private onClose = () => {
    this.dispatchEvent(new Event('close'))
  }

  private onError = (event: Event) => {
    if (event instanceof CustomEvent) {
      this.dispatchEvent(new CustomEvent('error', { detail: event.detail }))
    }
  }
  // #endregion

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
    }

    const { promise, reject, resolve } = Promise.withResolvers<T>()
    this.pending.set(request.id, { promise, request, resolve, reject, signal })

    return this.transport.send<T>(request)
  }
}
