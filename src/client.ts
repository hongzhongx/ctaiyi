import type { HTTPTransport } from './transports'
import type { PendingRequest, RPCCall, Transport } from './transports/transport'
import { hexToBytes } from '@noble/hashes/utils'
import defu from 'defu'
import invariant from 'tiny-invariant'
import { version } from '../package.json' with { type: 'json' }
import { BaiYuJingAPI } from './helpers/baiyujing'
import { Blockchain } from './helpers/blockchain'
import { BroadcastAPI } from './helpers/broadcast'
import { http } from './transports'

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

export interface ClientOptions<T extends Transport> {
  /**
   * 链ID
   */
  chainId?: string
  /**
   * 地址前缀
   * @default 'TAI'
   */
  addressPrefix?: string

  transport: T
}

// MARK: Client
/**
 * RPC client
 */
export class Client<T extends Transport = Transport> {
  static testnet<T extends Transport = HTTPTransport>(options: Partial<ClientOptions<T>> = {}) {
    const o = defu(options, {
      transport: http('https://127.0.0.1:8090'),
      chainId: '18dcf0a285365fc58b71f18b3d3fec954aa0c141c44e4e5cb4cf777b9eab274e',
    }) as ClientOptions<T>
    return new Client(o)
  }

  // #region Client Properties
  public readonly chainId: Uint8Array
  public readonly addressPrefix: string

  public pending = new Map<number, PendingRequest>()
  private seqNo = 0
  public readonly transport: T

  // #region Helper
  public readonly baiyujing: BaiYuJingAPI
  public readonly blockchain: Blockchain
  public readonly broadcast: BroadcastAPI
  // #endregion

  constructor(options: ClientOptions<T>) {
    this.chainId = options.chainId ? hexToBytes(options.chainId) : DEFAULT_CHAIN_ID
    invariant(this.chainId.length === 32, 'invalid chain id')
    this.addressPrefix = options.addressPrefix || DEFAULT_ADDRESS_PREFIX

    this.baiyujing = new BaiYuJingAPI(this)
    this.blockchain = new Blockchain(this)
    this.broadcast = new BroadcastAPI(this)

    this.transport = options.transport
  }

  public call<Response = any>(api: string, method: string, params: any[] = []): Promise<Response> {
    const request: RPCCall = {
      id: ++this.seqNo,
      method: 'call',
      params: [api, method, params],
      jsonrpc: '2.0',
    }
    return this.transport.send<Response>(request)
  }
}
