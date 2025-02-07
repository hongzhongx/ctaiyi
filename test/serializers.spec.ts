import type { Serializer } from './../src'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import ByteBuffer from 'bytebuffer'
import { HexBuffer, Types } from './../src'

import serializerTests from './serializer-tests.json' with { type: 'json' }

function serialize(serializer: Serializer, data: any) {
  const buffer = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
  serializer(buffer, data)
  buffer.flip()
  return bytesToHex(new Uint8Array(buffer.toArrayBuffer()))
}

describe('serializers', () => {
  for (const test of serializerTests) {
    it(test.name, () => {
      let serializer: Serializer
      if (!test.name.includes('::')) {
        serializer = Types[test.name as unknown as keyof typeof Types] as Serializer
      }
      else {
        const [base, ...sub] = test.name.split('::').map(t => Types[t as unknown as keyof typeof Types]) as [(...args: any[]) => Serializer, ...Serializer[]]
        serializer = base(...sub) as Serializer
      }
      for (const [expected, value] of test.values) {
        const actual = serialize(serializer, value)
        expect(actual).toBe(expected)
      }
    })
  }

  it('binary', () => {
    const data = HexBuffer.from('026400c800')
    const r1 = serialize(Types.Binary(), HexBuffer.from([0x80, 0x00, 0x80]))
    expect(r1).toBe('03800080')
    const r2 = serialize(Types.Binary(), HexBuffer.from(hexToBytes('026400c800')))
    expect(r2).toBe('05026400c800')
    const r3 = serialize(Types.Binary(5), HexBuffer.from(data))
    expect(r3).toBe('026400c800')
    expect(() => {
      serialize(Types.Binary(10), data)
    }).toThrow()
  })

  it('void', () => {
    expect(() => {
      serialize(Types.Void, null)
    }).toThrow()
  })

  it('invalid Operations', () => {
    expect(() => {
      serialize(Types.Operation, ['transfer', {}])
    }).toThrow()
    expect(() => {
      serialize(Types.Operation, ['transfer', { from: 1 }])
    }).toThrow()
    expect(() => {
      serialize(Types.Operation, ['transfer', 10])
    }).toThrow()
  })
})
