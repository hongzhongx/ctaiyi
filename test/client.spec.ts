import type { ClientMessageError } from './../src'
import { Client } from './../src'
import { waitForEvent } from './../src/utils'

describe('client', () => {
  vi.setConfig({
    testTimeout: 100000,
  })
  const client = Client.testnet({ autoConnect: false })

  it('should connect', async () => {
    await client.connect()
    expect(client.isConnected()).toBe(true)
  })

  it('should make rpc call', async () => {
    const config = await client.call('baiyujing_api', 'get_config')
    expect(config)
    expect(config).toHaveProperty('IS_TEST_NET')
  })

  it('should reconnect on disconnection', async () => {
    // @ts-expect-error test usage
    client.socket!.close()
    await waitForEvent(client, 'open')
  })

  it('should flush call buffer on reconnection', async () => {
    // @ts-expect-error test usage
    client.socket!.close()
    const p1 = client.call('baiyujing_api', 'get_accounts', [['initminer']])
    const p2 = client.call('baiyujing_api', 'get_accounts', [['null']])
    const [r1, r2] = await Promise.all([p1, p2])
    expect(r1.length).toBe(1)
    expect(r1[0].name).toBe('initminer')
    expect(r2.length).toBe(1)
    expect(r2[0].name).toBe('null')
  })

  it('should time out when loosing connection', async () => {
    client.sendTimeout = 100
    await client.disconnect()
    try {
      await client.call('baiyujing_api', 'get_accounts', [['initminer']]) as any[]
      assert(false, 'should not be reached')
    }
    catch (error) {
      assert.equal((error as Error).name, 'TimeoutError')
    }
    client.sendTimeout = 5000
    await client.connect()
  })

  it('should handle rpc errors', async () => {
    try {
      await client.call('baiyujing_api', 'method_does_exist')
      assert(false, 'should not be reached')
    }
    catch (error) {
      assert(error instanceof Error)

      expect(error.name).toBe('RPCError')
      expect(error.message).toBe(`method_itr != api_itr->second.end(): Could not find method method_does_exist`)

      expect((error.cause as any).code).toBe(10)
      expect((error.cause as any).name).toBe('assert_exception')
      expect((error.cause as any).stack[0].data.method).toBe('method_does_exist')
    }
  })

  it('should handle garbled data from server', async () => {
    const errorPromise = waitForEvent<CustomEvent<ClientMessageError>>(client, 'error')
    // @ts-expect-error test usage
    client.onMessage({ data: 'this}}is notJSON!' })
    const error = await errorPromise
    expect(error.detail.name).toBe('MessageError')
  })

  it('should handle write errors', async () => {
    // @ts-expect-error test usage
    const socketSend = client.socket!.send
    // @ts-expect-error test usage
    client.socket!.send = () => {
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
    client.socket!.send = socketSend
  })

  it('should disconnect', async () => {
    await client.disconnect()
    assert(!client.isConnected())
  })
})
