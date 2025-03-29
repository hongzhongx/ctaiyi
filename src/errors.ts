/**
 * WebSocket 通用错误
 */
export class ClientWebSocketError extends Error {
  override name = 'WebSocketError'
  constructor(message: string, init?: ErrorOptions) {
    super(message, init)
  }
}

/**
 * HTTP 通用错误
 */
export class ClientHTTPError extends Error {
  override name = 'HTTPError'
  constructor(message: string, init?: ErrorOptions) {
    super(message, init)
  }
}

export class ClientTimeoutError extends Error {
  override name = 'TimeoutError'
  constructor(message: string, init?: ErrorOptions) {
    super(message, init)
  }
}

/**
 * RPC 错误
 */
export class RPCError extends Error {
  override name = 'RPCError'
  override cause?: {
    code: number
    name: string
    message: string
    stack: any[]
  }

  constructor(message: string, init?: ErrorOptions) {
    super(message, init)
    this.cause = init?.cause as this['cause']
  }
}
