/**
 * @file Misc utility functions.
 */

import type { EventEmitter } from 'events'
import type { PublicKey } from './crypto'

import type { Asset } from './taiyi/asset'
import type { SimingSetPropertiesOperation } from './taiyi/operation'
import type { Serializer } from './taiyi/serializer'
import { PassThrough } from 'stream'
// Hack to be able to generate a valid siming_set_properties op
// Can hopefully be removed when taiyi's JSON representation is fixed
import * as ByteBuffer from 'bytebuffer'
import { Types } from './taiyi/serializer'

const fetch = global.fetch // tslint:disable-line:no-string-literal

/**
 * Return a promise that will resove when a specific event is emitted.
 */
export function waitForEvent<T>(emitter: EventEmitter, eventName: string | symbol): Promise<T> {
  return new Promise((resolve, reject) => {
    emitter.once(eventName, resolve)
  })
}

/**
 * Sleep for N milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Return a stream that emits iterator values.
 */
export function iteratorStream<T>(iterator: AsyncIterableIterator<T>): NodeJS.ReadableStream {
  const stream = new PassThrough({ objectMode: true })
  const iterate = async () => {
    for await (const item of iterator) {
      if (!stream.write(item)) {
        await waitForEvent(stream, 'drain')
      }
    }
  }
  iterate().then(() => {
    stream.end()
  }).catch((error) => {
    stream.emit('error', error)
    stream.end()
  })
  return stream
}

/**
 * Return a deep copy of a JSON-serializable object.
 */
export function copy<T>(object: T): T {
  return JSON.parse(JSON.stringify(object))
}

/**
 * Fetch API wrapper that retries until timeout is reached.
 */
export async function retryingFetch(url: string, opts: any, timeout: number, backoff: (tries: number) => number, fetchTimeout?: (tries: number) => number) {
  const start = Date.now()
  let tries = 0
  do {
    try {
      if (fetchTimeout) {
        opts.timeout = fetchTimeout(tries)
      }
      const response = await fetch(url, opts)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    }
    catch (error) {
      if (timeout !== 0 && Date.now() - start > timeout) {
        throw error
      }
      await sleep(backoff(tries++))
    }
  } while (true)
}
export interface SimingProps {
  account_creation_fee?: string | Asset
  key: PublicKey | string
  maximum_block_size?: number // uint32_t
  new_signing_key?: PublicKey | string | null
  url?: string
}
function serialize(serializer: Serializer, data: any) {
  const buffer = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
  serializer(buffer, data)
  buffer.flip()
  return Buffer.from(buffer.toBuffer())
}
export function buildSimingUpdateOp(owner: string, props: SimingProps): SimingSetPropertiesOperation {
  const data: SimingSetPropertiesOperation[1] = {
    extensions: [],
    owner,
    props: [],
  }
  for (const key of Object.keys(props)) {
    let type: Serializer
    switch (key) {
      case 'key':
      case 'new_signing_key':
        type = Types.PublicKey
        break
      case 'maximum_block_size':
        type = Types.UInt32
        break
      case 'url':
        type = Types.String
        break
      default:
        throw new Error(`Unknown siming prop: ${key}`)
    }
    data.props.push([key, serialize(type, props[key])])
  }
  data.props.sort((a, b) => a[0].localeCompare(b[0]))
  return ['siming_set_properties', data]
}
