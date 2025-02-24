import type { Awaitable } from 'vitest'
import type { HTTPTransport, WebSocketTransport } from '../src'
import { describe } from 'vitest'
import { Client, http, webSocket } from '../src'

const clients = [
  Client.testnet({
    transport: webSocket('ws://127.0.0.1:8090'),
  }),
  Client.testnet({
    transport: http('http://127.0.0.1:8090'),
  }),
] as const

export function runForBothTransports(
  name: string,
  fn: (vars: Client<WebSocketTransport> | Client<HTTPTransport>) => Awaitable<void>,
) {
  describe.for(clients)(name, fn)
}
