# 类型

ctaiyi 包中导出的类型

## Transaction

```ts twoslash
import { Operation } from '@taiyinet/ctaiyi'
// ---cut---
declare interface Transaction {
  ref_block_num: number
  ref_block_prefix: number
  expiration: string
  operations: Operation[]
  extensions: any[]
}
```

## SignedTransaction

```ts twoslash
import { Transaction } from '@taiyinet/ctaiyi'
// ---cut---
declare interface SignedTransaction extends Transaction {
  signatures: string[]
}
```

## TransactionConfirmation

```ts twoslash
declare interface TransactionConfirmation {
  id: string
  block_num: number
  trx_num: number
  expired: boolean
}
```

## AppliedOperation

```ts twoslash
import { Operation } from '@taiyinet/ctaiyi'
// ---cut---
declare interface AppliedOperation {
  trx_id: string
  block: number
  trx_in_block: number
  op_in_trx: number
  virtual_op: number
  timestamp: string
  op: Operation
}
```

## Asset

```ts twoslash
import { AssetSymbol, FaiAsset } from '@taiyinet/ctaiyi'
// ---cut---
declare class Asset {
  readonly amount: number
  readonly symbol: AssetSymbol
  readonly isFai: boolean
  /**
   * 从字符串创建一个 Asset 实例，例如 `42.000 QI` 或者 `4.2 \@@000000021`。
   */
  static fromString(string: string, expectedSymbol?: AssetSymbol): Asset
  /**
   * 创建新的 Asset。
   *
   * @param value 资产额度。
   * @param symbol 创建时使用的 symbol。也会用于验证资产，如果传递的值具有不同的 symbol 则会抛出错误。
   * @param isFai 是否是 fai 表示。
   */
  static from(value: string | Asset | number | FaiAsset, symbol?: AssetSymbol, isFai?: boolean): Asset
  /**
   * 返回两个资产中较小的一个。
   */
  static min(a: Asset, b: Asset): Asset
  /**
   * 返回两个资产中较大的一个。
   */
  static max(a: Asset, b: Asset): Asset
  constructor(amount: number, symbol: AssetSymbol, isFai?: boolean)
  /**
   * 返回资产的精度。
   */
  getPrecision(): number
  /**
   * 返回 fai 表示
   */
  static getFaiFromSymbol(symbol: string): string
  static getSymbolFromFai(fai: string): AssetSymbol
  /**
   * 返回一个新实例为两个资产相加。
   */
  add(amount: Asset | string | number): Asset
  /**
   * 返回一个新实例为两个资产相减。
   */
  subtract(amount: Asset | string | number): Asset
  /**
   * 返回一个新实例为两个资产相乘。
   */
  multiply(factor: Asset | string | number): Asset
  /**
   * 返回一个新实例为两个资产相除。
   */
  divide(divisor: Asset | string | number): Asset
  /**
   * 返回资产的字符串表示，例如 `42.000 QI`。
   */
  toString(): string
  /**
   * 用于 JSON 序列化
   */
  toJSON(): string
}
```

## FaiAsset

```ts twoslash
declare interface FaiAsset {
  amount: string | number
  precision: number
  fai: string
}
```

## Account

```ts twoslash
import { Asset, Authority, MaterialAssets } from '@taiyinet/ctaiyi'
// ---cut---
declare interface Account extends MaterialAssets {
  id: number // account_id_type
  name: string // account_name_type
  owner: Authority
  active: Authority
  posting: Authority
  memo_key: string
  json_metadata: string
  proxy: string

  last_owner_update: string
  last_account_update: string
  created: string
  recovery_account: string
  last_account_recovery: string

  can_adore: boolean

  balance: Asset | string
  reward_yang_balance: Asset | string
  reward_qi_balance: Asset | string
  reward_feigang_balance: Asset | string
  qi: Asset | string
  delegated_qi: Asset | string
  received_qi: Asset | string
  qi_withdraw_rate: Asset | string

  next_qi_withdrawal_time: string
  withdrawn: number
  to_withdraw: number
  withdraw_routes: number

  proxied_vsf_adores: number[]
  simings_adored_for: number

  qi_balance: Asset | string
}
```
