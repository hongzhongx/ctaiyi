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

  /**
   * 请求超时，单位：毫秒
   * @default 14000
   */
  timeout?: number
}

export interface HTTPClientOptions extends ClientOptions {
}

export interface WebSocketClientOptions extends ClientOptions {

  /**
   * 自动连接
   * @default true
   */
  autoConnect?: boolean

  retry?: number | ((failureCount: number, error: Error) => boolean) | RetryOptions
}

// MARK: Client
/**
 * RPC client
 */
export class Client {
  /**
   * 创建测试网客户端
   * @param options 客户端选项
   * @returns 测试网客户端实例
   */
  public static testnet(options?: (WebSocketClientOptions | HTTPClientOptions) & { url?: string }) {
    const opts: HTTPClientOptions = defu(options, {
      addressPrefix: 'TAI',
      chainId: '18dcf0a285365fc58b71f18b3d3fec954aa0c141c44e4e5cb4cf777b9eab274e',
    })
    const url = options?.url ?? 'http://127.0.0.1:8090'
    return new Client(url, opts) as Client
  }

  // #region Client Properties
  public readonly url: string
  public readonly chainId: Uint8Array
  public readonly addressPrefix: string

  public pending = new Map<number, PendingRequest>()
  public seqNo = 0
  public readonly transport: WebSocketTransport | HTTPTransport

  sendTimeout: number

  // #region Helper
  public readonly baiyujing: BaiYuJingAPI
  public readonly blockchain: Blockchain
  public readonly broadcast: BroadcastAPI
  // #endregion

  constructor(url: `http://${string}` | `https://${string}`, options?: HTTPClientOptions)
  constructor(url: `ws://${string}` | `wss://${string}`, options?: WebSocketClientOptions)
  constructor(url: string, options?: WebSocketClientOptions | HTTPClientOptions)
  constructor(url: string, options: WebSocketClientOptions | HTTPClientOptions = {}) {
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
    console.warn('[ctaiyi] isConnected() is unnecessary for HTTP transport')
    return true
  }

  public async connect(): Promise<void> {
    if (this.transport instanceof WebSocketTransport) {
      return this.transport.connect()
    }
    console.warn('[ctaiyi] connect() is unnecessary for HTTP transport')
  }

  public async disconnect(): Promise<void> {
    if (this.transport instanceof WebSocketTransport) {
      return this.transport.disconnect()
    }
    console.warn('[ctaiyi] disconnect() is unnecessary for HTTP transport')
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
    }

    const { promise, reject, resolve } = Promise.withResolvers<T>()
    this.pending.set(request.id, { promise, request, resolve, reject, signal })

    return this.transport.send<T>(request)
  }
}
