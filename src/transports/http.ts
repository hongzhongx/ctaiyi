import type { PendingRequest, RPCRequest, RPCResponse, Transport, TransportConfig } from './transport'
import { bytesToHex } from '@noble/hashes/utils'
import { ClientHTTPError, ClientTimeoutError } from '../errors'
import { normalizeRpcError } from '../utils'

export interface HTTPTransportConfig extends TransportConfig { }

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
