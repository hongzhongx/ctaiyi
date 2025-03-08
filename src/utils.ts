/**
 * @file Misc utility functions.
 */
/* eslint-disable antfu/consistent-list-newline */

import type { RPCResponseError } from './transports/transport'
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
  return url.match(/^wss?:\/\//) !== null
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

export function dammChecksum8digit(value: number) {
  if (value >= 100000000) {
    throw new Error('Value must be less than 100000000')
  }

  // Damm algorithm lookup table
  const t = [
    0, 30, 10, 70, 50, 90, 80, 60, 40, 20,
    70, 0, 90, 20, 10, 50, 40, 80, 60, 30,
    40, 20, 0, 60, 80, 70, 10, 30, 50, 90,
    10, 70, 50, 0, 90, 80, 30, 40, 20, 60,
    60, 10, 20, 30, 0, 40, 50, 90, 70, 80,
    30, 60, 70, 40, 20, 0, 90, 50, 80, 10,
    50, 80, 60, 90, 70, 20, 0, 10, 30, 40,
    80, 90, 40, 50, 30, 60, 20, 0, 10, 70,
    90, 40, 30, 80, 60, 10, 70, 20, 0, 50,
    20, 50, 80, 10, 40, 30, 60, 70, 90, 0,
  ]

  // 将8位数分解为单个数字
  const q0 = Math.floor(value / 10)
  const d0 = value % 10
  const q1 = Math.floor(q0 / 10)
  const d1 = q0 % 10
  const q2 = Math.floor(q1 / 10)
  const d2 = q1 % 10
  const q3 = Math.floor(q2 / 10)
  const d3 = q2 % 10
  const q4 = Math.floor(q3 / 10)
  const d4 = q3 % 10
  const q5 = Math.floor(q4 / 10)
  const d5 = q4 % 10
  const d6 = q5 % 10
  const d7 = Math.floor(q5 / 10)

  // 计算校验和
  let x = t[d7]
  x = t[x + d6]
  x = t[x + d5]
  x = t[x + d4]
  x = t[x + d3]
  x = t[x + d2]
  x = t[x + d1]
  x = t[x + d0]
  return Math.floor(x / 10)
}
