/**
 * 消息错误
 */
export class ClientMessageError extends Error {
  override name = 'MessageError'
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

/**
 * HTTP 通用错误
 */
export class ClientHTTPError extends Error {
  override name = 'HTTPError'
}

/**
 * RPC 错误
 */
export class RPCError extends Error {
  override name = 'RPCError'
}
