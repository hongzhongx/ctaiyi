import type { Transaction } from '../src'
import { inspect } from 'util'

import { concatBytes, hexToBytes, randomBytes } from '@noble/hashes/utils'
import ByteBuffer from 'bytebuffer'
import {
  cryptoUtils,
  DEFAULT_CHAIN_ID,
  PrivateKey,
  PublicKey,
  sha256,
  Signature,

  Types,
} from '../src'

describe('crypto', () => {
  const testnetPrefix = 'TAI'
  const testnetPair = {
    private: '5JQy7moK9SvNNDxn8rKNfQYFME5VDYC2j9Mv2tb7uXV5jz3fQR8',
    public: 'TAI8FiV6v7yqYWTZz8WuFDckWr62L9X34hCy6koe8vd2cDJHimtgM',
  }
  const mainPair = {
    private: '5K2yDAd9KAZ3ZitBsAPyRka9PLFemUrbcL6UziZiPaw2c6jCeLH',
    public: 'TAI8QykigLRi9ZUcNy1iXGY3KjRuCiLM8Ga49LHti1F8hgawKFc3K',
  }
  const mainPairPub = hexToBytes('03d0519ddad62bd2a833bee5dc04011c08f77f66338c38d99c685dee1f454cd1b8')

  const testSig = '202c52188b0ecbc26c766fe6d3ec68dac58644f43f43fc7d97da122f76fa028f98691dd48b44394bdd8cecbbe66e94795dcf53291a1ef7c16b49658621273ea68e'
  const testKey = PrivateKey.from(randomBytes(32))

  it('should decode public keys', () => {
    const k1 = PublicKey.fromString(testnetPair.public)
    assert.equal(k1.prefix, testnetPrefix)
    assert(k1.toString(), testnetPair.public)
    const k2 = PublicKey.from(mainPair.public)
    assert(k2.toString(), mainPair.public)
    const k3 = new PublicKey(mainPairPub, 'TAI')
    assert(k2.toString(), k3.toString())
    const k4 = PublicKey.from(testnetPair.public)
    assert(k4.toString(), testnetPair.public)
  })

  it('should decode private keys', () => {
    const k1 = PrivateKey.fromString(testnetPair.private)
    assert(k1.toString(), testnetPair.private)
    const k2 = PrivateKey.from(mainPair.private)
    assert(k2.toString(), mainPair.private)
  })

  it('should create public from private', () => {
    const key = PrivateKey.fromString(testnetPair.private)
    assert(key.createPublic().toString(), testnetPair.public)
  })

  it('should handle prefixed keys', () => {
    const key = PublicKey.from(testnetPair.public)
    assert(key.toString(), testnetPair.public)
    assert(PrivateKey.fromString(testnetPair.private).createPublic(testnetPrefix).toString(), testnetPair.public)
  })

  it('should conceal private key when inspecting', () => {
    const key = PrivateKey.fromString(testnetPair.private)
    assert.equal(inspect(key), 'PrivateKey: 5JQy7m...z3fQR8')
    assert.equal(inspect(key.createPublic(testnetPrefix)), 'PublicKey: TAI8FiV6v7yqYWTZz8WuFDckWr62L9X34hCy6koe8vd2cDJHimtgM')
  })

  it('should sign and verify', () => {
    const message = randomBytes(32)
    const signature = testKey.sign(message)

    assert(testKey.createPublic().verify(message, signature))
    signature.data[3] = 0x42
    assert(!testKey.createPublic().verify(message, signature))
  })

  it('should de/encode signatures', () => {
    const signature = Signature.fromUint8Array(hexToBytes(testSig))
    assert.equal(signature.toString(), testSig)
  })

  it('should recover pubkey from signatures', () => {
    const key = PrivateKey.fromString(testnetPair.private)
    const msg = randomBytes(32)
    const signature = key.sign(msg)
    assert.equal(
      signature.recover(msg).toString(),
      key.createPublic().toString(),
    )
  })

  it('should create key from login', () => {
    const key = PrivateKey.fromLogin('foo', 'barman')
    assert.equal(key.createPublic().toString(), 'TAI87F7tN56tAUL2C6J9Gzi9HzgNpZdi6M2cLQo7TjDU5v178QsYA')
  })

  it('should sign and verify transaction', () => {
    const tx: Transaction = {
      ref_block_num: 1234,
      ref_block_prefix: 1122334455,
      expiration: '2017-07-15T16:51:19',
      extensions: [
        'long-pants',
      ],
      operations: [
        ['account_siming_proxy', { account: 'foo', proxy: 'bar' }],
        // ['transfer', { from: 'foo', to: 'bar', amount: 10000, memo: 'memo' }],
      ],
    }
    const key = PrivateKey.fromSeed('hello')
    const buffer = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
    Types.Transaction(buffer, tx)
    buffer.flip()
    const data = new Uint8Array(buffer.toArrayBuffer())
    const digest = sha256(concatBytes(DEFAULT_CHAIN_ID, data))
    const signed = cryptoUtils.signTransaction(tx, key)
    const pkey = key.createPublic()
    const sig = Signature.fromString(signed.signatures[0])
    assert(pkey.verify(digest, sig))
    assert.equal(sig.recover(digest).toString(), 'TAI7s4VJuYFfHq8HCPpgC649Lu7CjA1V9oXgPfv8f3fszKMk3Kny9')
  })

  it('should handle serialization errors', () => {
    const tx: any = {
      ref_block_num: 1234,
      ref_block_prefix: 1122334455,
      expiration: new Date().toISOString().slice(0, -5),
      extensions: [],
      operations: [
        ['shutdown_network', {}],
      ],
    }
    assert.throws(
      () => cryptoUtils.signTransaction(tx, testKey),
      'Unable to serialize transaction',
    )
  })
})
