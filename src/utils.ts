/**
 * @file Misc utility functions.
 */

import type { RPCResponseError } from './transport'
import { RPCError } from './errors'

export function waitForEvent<T>(target: EventTarget, event: string): Promise<T> {
  return new Promise<T>((resolve) => {
    target.addEventListener(
      event,
      (e) => {
        resolve(e as T)
      },
      { once: true },
    )
  })
}

export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function iteratorStream<T>(iterator: AsyncIterableIterator<T>): ReadableStream<T> {
  return new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next()
        if (done) {
          controller.close()
        }
        else {
          controller.enqueue(value)
        }
      }
      catch (error) {
        controller.error(error)
      }
    },
  })
}

export function isWebSocketProtocol(url: string): url is `ws://${string}` | `wss://${string}` {
  const protocol = new URL(url).protocol
  return ['ws:', 'wss:'].includes(protocol)
}

export function normalizeRpcError(responseError: RPCResponseError): Error {
  const { data } = responseError
  let { message } = responseError

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

  return new RPCError(message, { cause: data })
}
