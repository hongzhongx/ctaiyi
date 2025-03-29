import type { ClientWebSocketError } from '../src/errors'
import { RPCError } from '../src/errors'
import { waitForEvent } from './../src/utils'
import { runForBothTransports } from './fixture'

vi.setConfig({
  testTimeout: 60 * 1000,
})

runForBothTransports('client for transport $transport.type', (client) => {
  it('should make rpc call', async () => {
    const config = await client.call('baiyujing_api', 'get_config')
    expect(config)
    expect(config).toHaveProperty('IS_TEST_NET')
  })

  it('should handle rpc errors', async () => {
    try {
      await client.call('baiyujing_api', 'method_does_exist')
      assert(false, 'should not be reached')
    }
    catch (error) {
      assert(error instanceof Error)

      expect(error.name).toBe(client.transport.type === 'websocket' ? 'WebSocketError' : 'HTTPError')
      expect(error.message).toBe(client.transport.type === 'websocket' ? `WebSocket request error` : `HTTP request failed`)

      assert(error.cause instanceof RPCError)
      expect(error.cause.message).toBe(`method_itr != api_itr->second.end(): Could not find method method_does_exist`)

      expect(error.cause.cause?.code).toBe(10)
      expect(error.cause.cause?.name).toBe('assert_exception')
      expect(error.cause.cause?.stack[0]?.data.method).toBe('method_does_exist')
    }
  })

  describe.runIf(client.transport.type === 'websocket')(
    'websocket transport connection',
    async () => {
      it('should connected', async () => {
        assert(client.transport.type === 'websocket')
        expect(client.transport.isConnected()).toBe(true)
      })

      it('should reconnect on disconnection', async () => {
        assert(client.transport.type === 'websocket')
        // @ts-expect-error test usage
        client.transport.socket!.close()
        await waitForEvent(client.transport, 'open')
      })

      it('should handle garbled data from server', async () => {
        assert(client.transport.type === 'websocket')
        const errorPromise = waitForEvent<CustomEvent<ClientWebSocketError>>(client.transport, 'error')
        const e = new MessageEvent('message', { data: 'this}}is notJSON!' })
        // @ts-expect-error test usage
        client.transport.onMessage(e)
        const error = await errorPromise
        expect(error.detail.name).toBe('WebSocketError')
      })

      it('should handle write errors', async () => {
        assert(client.transport.type === 'websocket')
        // @ts-expect-error test usage
        const socketSend = client.transport.socket!.send
        // @ts-expect-error test usage
        client.transport.socket!.send = () => {
          throw new Error('Send fail')
        }
        try {
          await client.call('database_api', 'i_like_turtles')
          assert(false, 'should not be reached')
        }
        catch (error) {
          expect((error as Error).message).toBe('Send fail')
        }
        // @ts-expect-error test usage
        client.transport.socket!.send = socketSend
      })

      it('should disconnect', async () => {
        assert(client.transport.type === 'websocket')
        await client.transport.connect()
        assert(client.transport.isConnected())
        await client.transport.disconnect()
        assert(!client.transport.isConnected())
      })
    },
  )
})
