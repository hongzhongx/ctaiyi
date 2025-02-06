import type { SignedTransaction, Transaction } from './taiyi/transaction'
import { hmac } from '@noble/hashes/hmac'
import { ripemd160 as nobleRipemd160 } from '@noble/hashes/ripemd160'
import { sha256 as nobleSha256 } from '@noble/hashes/sha2'
import { bytesToHex, concatBytes, hexToBytes } from '@noble/hashes/utils'
import * as secp from '@noble/secp256k1'
import bs58 from 'bs58'
import ByteBuffer from 'bytebuffer'
import invariant from 'tiny-invariant'
import { DEFAULT_ADDRESS_PREFIX, DEFAULT_CHAIN_ID } from './client'
import { Types } from './taiyi/serializer'

secp.etc.hmacSha256Sync = (k, ...m) => hmac(nobleSha256, k, secp.etc.concatBytes(...m))

/**
 * WIF 编码的 Network ID。
 */
export const NETWORK_ID = new Uint8Array([0x80])

/**
 * 返回输入的 ripemd160 哈希值。
 */
export function ripemd160(input: Uint8Array | string): Uint8Array {
  return nobleRipemd160(input)
}

/**
 * 返回输入的 sha256 哈希值。
 */
export function sha256(input: Uint8Array | string): Uint8Array {
  return nobleSha256(input)
}

/**
 * 返回输入的 2 轮 sha256 哈希值。
 */
export function doubleSha256(input: Uint8Array | string): Uint8Array {
  return sha256(sha256(input))
}

/**
 * 使用 `bs58 + ripemd160 - checksum` 编码公钥。
 */
export function encodePublic(key: Uint8Array | string, prefix: string): string {
  const msg = typeof key === 'string' ? new TextEncoder().encode(key) : key
  const checksum = ripemd160(msg)

  const combined = concatBytes(msg, checksum.slice(0, 4))
  return prefix + bs58.encode(combined)
}

/**
 * 解码 `bs58 + ripemd160 - checksum` 编码的公钥。
 */
export function decodePublic(encodedKey: string): { key: Uint8Array, prefix: string } {
  const prefix = encodedKey.slice(0, 3)
  invariant(prefix.length === 3, 'public key invalid prefix')
  encodedKey = encodedKey.slice(3)
  const buffer = bs58.decode(encodedKey)
  const checksum = buffer.slice(-4)
  const key = buffer.slice(0, -4)
  const checksumVerify = ripemd160(key).slice(0, 4)
  invariant(bytesToHex(checksumVerify) === bytesToHex(checksum), 'public key checksum mismatch')
  return { key, prefix }
}

/**
 * 使用 `bs58 + doubleSha256 - checksum` 编码私钥。
 */
export function encodePrivate(key: Uint8Array | string): string {
  const msg = typeof key === 'string' ? new TextEncoder().encode(key) : key
  invariant(msg.at(0) === 0x80, 'private key network id mismatch')
  const checksum = doubleSha256(msg)

  const combined = concatBytes(msg, checksum.slice(0, 4))
  return bs58.encode(combined)
}

/**
 * 解码 `bs58 + doubleSha256 - checksum` 编码的私钥。
 */
export function decodePrivate(encodedKey: string): Uint8Array {
  const buffer = bs58.decode(encodedKey)
  invariant(bytesToHex(buffer.slice(0, 1)) === bytesToHex(NETWORK_ID), 'private key network id mismatch')
  const checksum = buffer.slice(-4)
  const key = buffer.slice(0, -4)
  const checksumVerify = doubleSha256(key).slice(0, 4)
  invariant(bytesToHex(checksumVerify) === bytesToHex(checksum), 'private key checksum mismatch')
  return key
}

/**
 * 如果签名是规范的，则返回 true，否则返回 false。
 */
function isCanonicalSignature(signature: Uint8Array): boolean {
  return (
    !(signature[0] & 0x80)
    && !(signature[0] === 0 && !(signature[1] & 0x80))
    && !(signature[32] & 0x80)
    && !(signature[32] === 0 && !(signature[33] & 0x80))
  )
}

/**
 * ECDSA (secp256k1) 公钥。
 */
export class PublicKey {
  /**
   * 从 WIF 编码的字符串创建公钥。
   */
  public static fromString(wif: string): PublicKey {
    const { key, prefix } = decodePublic(wif)
    return new PublicKey(key, prefix)
  }

  /**
   * 从字符串或公钥实例创建公钥。
   */
  public static from(value: string | PublicKey) {
    if (value instanceof PublicKey) {
      return value
    }
    else {
      return PublicKey.fromString(value)
    }
  }

  constructor(
    public readonly key: Uint8Array,
    public readonly prefix: string = DEFAULT_ADDRESS_PREFIX,
  ) {
    invariant(
      secp.ProjectivePoint.fromHex(key).assertValidity(),
      'invalid public key',
    )
  }

  /**
   * 验证 32 字节的签名。
   * @param message 要验证的 32 字节消息。
   * @param signature 要验证的签名。
   */
  public verify(message: Uint8Array, signature: Signature): boolean {
    return secp.verify(signature.data, message, this.key)
  }

  /**
   * 返回一个 WIF 编码的密钥。
   */
  public toString() {
    return encodePublic(this.key, this.prefix)
  }

  /**
   * 返回一个 JSON 编码的密钥。
   */
  public toJSON() {
    return this.toString()
  }

  /**
   * 用于 node.js 中的 `utils.inspect` 和 `console.log`。
   */
  public [Symbol.for('nodejs.util.inspect.custom')]() {
    return `PublicKey: ${this.toString()}`
  }
}

export type KeyRole = 'owner' | 'active' | 'posting' | 'memo'

/**
 * ECDSA (secp256k1) 私钥。
 */
export class PrivateKey {
  /**
   * 通过 WIF 编码的字符串或 Uint8Array 实例创建私钥。
   */
  public static from(value: string | Uint8Array) {
    if (typeof value === 'string') {
      return PrivateKey.fromString(value)
    }
    else {
      return new PrivateKey(value)
    }
  }

  /**
   * 通过 WIF 编码的字符串创建私钥。
   */
  public static fromString(wif: string) {
    return new PrivateKey(decodePrivate(wif).slice(1))
  }

  /**
   * 通过种子字符串创建私钥。
   */
  public static fromSeed(seed: string) {
    return new PrivateKey(sha256(seed))
  }

  /**
   * 通过 username 和 password 创建私钥。
   */
  public static fromLogin(username: string, password: string, role: KeyRole = 'active') {
    const seed = username + role + password
    return PrivateKey.fromSeed(seed)
  }

  constructor(private key: Uint8Array) {
    invariant(secp.utils.isValidPrivateKey(key), 'invalid private key')
  }

  /**
   * 签名消息。
   * @param message 32 字节消息。
   */
  public sign(message: Uint8Array): Signature {
    let signature: secp.SignatureWithRecovery
    let attempts = 0
    do {
      const data = concatBytes(message, new Uint8Array([attempts++]))

      const options = { extraEntropy: sha256(data) }

      signature = secp.sign(message, this.key, options)
    } while (!isCanonicalSignature(signature.toCompactRawBytes()))
    return new Signature(signature.toCompactRawBytes(), signature.recovery)
  }

  /**
   * 派生公钥。
   */
  public createPublic(prefix?: string, isCompressed: boolean = true): PublicKey {
    return new PublicKey(secp.getPublicKey(this.key, isCompressed), prefix)
  }

  /**
   * 返回一个 WIF 编码的密钥。
   */
  public toString() {
    const combined = concatBytes(NETWORK_ID, this.key)
    return encodePrivate(combined)
  }

  /**
   * 用于 node.js 中的 `utils.inspect` 和 `console.log`。不显示完整的密钥。
   * 要获取完整的编码密钥，需要显式调用 {@link toString}。
   */
  public [Symbol.for('nodejs.util.inspect.custom')]() {
    const key = this.toString()
    return `PrivateKey: ${key.slice(0, 6)}...${key.slice(-6)}`
  }
}

/**
 * ECDSA (secp256k1) 签名。
 */
export class Signature {
  public static fromUint8Array(array: Uint8Array) {
    invariant(array.length === 65, 'invalid signature')
    const recovery = array.at(0)! - 31
    const data = array.slice(1)
    return new Signature(data, recovery)
  }

  public static fromString(string: string) {
    return Signature.fromUint8Array(hexToBytes(string))
  }

  constructor(public data: Uint8Array, public recovery: number) {
    invariant(data.length === 64, 'invalid signature')
  }

  /**
   * 通过提供原始签名消息恢复公钥。
   * @param message 用于创建签名的 32 字节消息。
   */
  public recover(message: Uint8Array, prefix?: string) {
    const sig = secp.Signature.fromCompact(this.data).addRecoveryBit(this.recovery)
    return new PublicKey(sig.recoverPublicKey(message).toRawBytes(), prefix)
  }

  public toBuffer() {
    return concatBytes(new Uint8Array([this.recovery + 31]), this.data)
  }

  public toString() {
    return bytesToHex(this.toBuffer())
  }
}

/**
 * 返回交易的 sha256 摘要。
 * @param chainId 用于创建哈希的链 ID。
 */
function transactionDigest(
  transaction: Transaction | SignedTransaction,
  chainId: Uint8Array,
) {
  const buffer = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
  try {
    Types.Transaction(buffer, transaction)
  }
  catch (cause) {
    const e = new Error('Unable to serialize transaction', { cause })
    e.name = 'SerializationError'
    throw e
  }
  buffer.flip()

  const digest = sha256(concatBytes(chainId, new Uint8Array(buffer.toArrayBuffer())))
  return digest
}

/**
 * 返回带有签名附加到签名数组的交易副本。
 * @param transaction 要签名的交易。
 * @param keys 用于签名的密钥。
 * @param options 链 ID 和地址前缀，与 {@link Client} 兼容。
 */
function signTransaction(
  transaction: Transaction,
  keys: PrivateKey | PrivateKey[],
  chainId: Uint8Array = DEFAULT_CHAIN_ID,
) {
  const digest = transactionDigest(transaction, chainId)
  const signedTransaction = structuredClone(transaction) as SignedTransaction
  if (!signedTransaction.signatures) {
    signedTransaction.signatures = []
  }

  if (!Array.isArray(keys)) {
    keys = [keys]
  }
  for (const key of keys) {
    const signature = key.sign(digest)
    signedTransaction.signatures.push(signature.toString())
  }

  return signedTransaction
}

export const cryptoUtils = {
  decodePrivate,
  doubleSha256,
  encodePrivate,
  encodePublic,
  isCanonicalSignature,
  ripemd160,
  sha256,
  signTransaction,
  transactionDigest,
}
