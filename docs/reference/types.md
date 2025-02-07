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

## ExtendedAccount

```ts twoslash
import { Account, AppliedOperation } from '@taiyinet/ctaiyi'
// ---cut---
declare interface ExtendedAccount extends Account {
  transfer_history: [nonce: number, operation: AppliedOperation][]
  other_history: [nonce: number, operation: AppliedOperation][]
  siming_adores: [nonce: number, operation: AppliedOperation][]
}
```

## Authority

```ts twoslash
import { PublicKey } from '@taiyinet/ctaiyi'
// ---cut---
declare interface AuthorityType {
  weight_threshold: number
  account_auths: Array<[string, number]>
  key_auths: Array<[string | PublicKey, number]>
}
```

## MaterialAssets

```ts twoslash
import { Asset } from '@taiyinet/ctaiyi'
// ---cut---
declare interface MaterialAssets {
  gold: Asset | string
  food: Asset | string
  wood: Asset | string
  fabric: Asset | string
  herb: Asset | string
}
```

## ChainProperties

```ts twoslash
import { Asset } from '@taiyinet/ctaiyi'
// ---cut---
declare interface ChainProperties {
  /**
   * 这笔费用以 YANG 支付，会为新账户兑换成 QI。
   * 没有 QI 的账户无法获得使用配额，因此毫无影响力。
   * 这笔最低费用要求所有账户对网络做出一定的投入，其中包括投票及进行交易的能力。
   */
  account_creation_fee: string | Asset
  /**
   * 司命投票针对的是最大区块大小，网络利用该参数来调整速率限制和容量。
   */
  maximum_block_size: number
}
```

## DynamicGlobalProperties

```ts twoslash
import { Asset } from '@taiyinet/ctaiyi'
// ---cut---
declare interface DynamicGlobalProperties {
  id: number
  head_block_number: number
  head_block_id: string
  time: string
  /** 当前总等价阳寿供应量（包含真气、物质所有的等价阳寿总量） */
  current_supply: Asset | string
  /** 当前总的真气（自由真气） */
  total_qi: Asset | string
  /** 当前总的真气（自由真气） */
  pending_rewarded_qi: Asset | string
  pending_rewarded_feigang: Asset | string
  pending_cultivation_qi: Asset | string
  /** 当前总的金石（包括NFA内含物质） */
  total_gold: Asset | string
  /** 当前总的食物（包括NFA内含物质） */
  total_food: Asset | string
  /** 当前总的木材（包括NFA内含物质） */
  total_wood: Asset | string
  /** 当前总的织物（包括NFA内含物质） */
  total_fabric: Asset | string
  /** 当前总的药材（包括NFA内含物质） */
  total_herb: Asset | string
  /** 最大区块大小 */
  maximum_block_size: number
  /** 当前绝对槽位号 */
  current_aslot: number
  /** 最近槽位填充情况 */
  recent_slots_filled: string
  /** 参与度计数（除以128得到参与百分比） */
  participation_count: number
  /** 最后一个不可逆区块号 */
  last_irreversible_block_num: number
}
```

## QiDelegation

```ts twoslash
import { Asset } from '@taiyinet/ctaiyi'
// ---cut---
declare interface QiDelegation {
  /**
   * 委托 ID。
   */
  id: number
  /**
   * 向受托人（接受委托者）委托 QI 的账户。
   */
  delegator: string
  /**
   * 从委托者处接收 QI 的账户
   */
  delegatee: string
  /**
   * 委托的 QI 数量。
   */
  qi: Asset | string
  /**
   * 最早可以移除委托的时间。
   */
  min_delegation_time: string
}
```

## Siming

```ts twoslash
declare interface Siming {
  adores: number
  created: string
  hardfork_time_vote: string
  hardfork_version_vote: string
  id: number
  last_aslot: number
  last_confirmed_block_num: number
  owner: string
  props: {
    account_creation_fee: string
    maximum_block_size: number
  }
  running_version: string
  signing_key: string
  total_missed: number
  url: string
  virtual_last_update: string
  virtual_position: string
  virtual_scheduled_time: string
}
```

## ScheduleSiming

```ts twoslash
declare interface ScheduleSiming {
  current_shuffled_simings: string[]
  current_virtual_time: string
  elected_weight: number
  hardfork_required_simings: number
  id: number
  majority_version: string
  max_adored_simings: number
  median_props: {
    account_creation_fee: string
    maximum_block_size: number
  }
  miner_weight: number
  next_shuffle_block_num: number
  num_scheduled_simings: number
  siming_pay_normalization_factor: number
  timeshare_weight: number
}
```

## RewardFund

```ts twoslash
declare interface RewardFund {
  id: number
  name: string
  reward_balance: string
  reward_qi_balance: string
  percent_content_rewards: number
  last_update: string
}
```

## Actor

```ts twoslash
declare interface Actor {
  age: number
  agility: number
  agility_max: number
  base_name: string
  born: boolean
  born_time: string
  born_vmonths: number
  born_vtimes: number
  born_vyears: number
  charm: number
  charm_max: number
  comprehension: number
  comprehension_max: number
  fertility: number
  five_phase: number
  gender: number
  health: number
  health_max: number
  id: number
  init_attribute_amount_max: number
  last_update: string
  location: string
  loyalty: number
  mood: number
  mood_max: number
  name: string
  next_tick_time: string
  nfa_id: number
  physique: number
  physique_max: number
  sexuality: number
  standpoint: number
  standpoint_type: string
  strength: number
  strength_max: number
  talents: [number, number][]
  vitality: number
  vitality_max: number
  willpower: number
  willpower_max: number
}
```

## ActorTalentRule

```ts twoslash
declare interface ActorTalentRule {
  id: number
  title: string
  description: string
  removed: boolean
  init_attribute_amount_modifier: number
  max_triggers: number
  main_contract: number
  created: string
  last_update: string
}
```

## Nfa

```ts twoslash
import { Asset, LuaValue } from '@taiyinet/ctaiyi'
// ---cut---
declare interface Nfa {
  id: number
  symbol: string
  main_contract: string
  children: number[]
  contract_data: [ { key: LuaValue }, LuaValue ][]
  created_time: string
  next_tick_time: string
  creator_account: string
  owner_account: string
  active_account: string
  parent: string
  cultivation_value: number
  debt_contract: string
  debt_value: number
  qi: Asset | string
  fabric: Asset | string
  food: Asset | string
  gold: Asset | string
  herb: Asset | string
  wood: Asset | string
  material_fabric: Asset | string
  material_food: Asset | string
  material_gold: Asset | string
  material_herb: Asset | string
  material_wood: Asset | string
  five_phase: number
}
```

## Zone

```ts twoslash
import { ZoneType } from '@taiyinet/ctaiyi'
// ---cut---
declare interface Zone {
  id: number
  last_grow_vmonth: number
  name: string
  nfa_id: number
  type: ZoneType
}
```

## ZoneType

```ts twoslash
type ZoneType = 'XUKONG' | 'YUANYE' | 'HUPO' | 'NONGTIAN' | 'LINDI' | 'MILIN' | 'YUANLIN' | 'SHANYUE' | 'DONGXUE' | 'SHILIN' | 'QIULIN' | 'TAOYUAN' | 'SANGYUAN' | 'XIAGU' | 'ZAOZE' | 'YAOYUAN' | 'HAIYANG' | 'SHAMO' | 'HUANGYE' | 'ANYUAN' | 'DUHUI' | 'MENPAI' | 'SHIZHEN' | 'GUANSAI' | 'CUNZHUANG'
```

## TianDaoProperties

```ts twoslash
import { ZoneType } from '@taiyinet/ctaiyi'
// ---cut---
declare interface TianDaoProperties {
  id: number
  v_years: number
  v_months: number
  v_times: number
  amount_actor_last_vyear: number
  dead_actor_last_vyear: number
  next_npc_born_time: string
  cruelty: number
  decay: number
  enjoyment: number
  falsity: number
  zone_fabric_max_map: number[]
  zone_food_max_map: number[]
  zone_gold_max_map: number[]
  zone_herb_max_map: number[]
  zone_wood_max_map: number[]
  zone_grow_fabric_speed_map: number[]
  zone_grow_food_speed_map: number[]
  zone_grow_gold_speed_map: number[]
  zone_grow_herb_speed_map: number[]
  zone_grow_wood_speed_map: number[]
  zone_moving_difficulty_map: number[]
  zone_type_connection_max_num_map: [string, ZoneType][]
}
```

## OwnerHistory

```ts twoslash
import { AuthorityType } from '@taiyinet/ctaiyi'
// ---cut---
declare interface OwnerHistory {
  id: number
  account: string
  previous_owner_authority: AuthorityType
  last_valid_time: number
}
```

## RecoveryRequest

```ts twoslash
import { AuthorityType } from '@taiyinet/ctaiyi'
// ---cut---
declare interface RecoveryRequest {
  id: number
  account_to_recover: string
  new_owner_authority: AuthorityType
  expires: number
}
```

## NfaActionEvalResult

```ts twoslash
import { LuaValue } from '@taiyinet/ctaiyi'
// ---cut---
declare interface NfaActionEvalResult {
  eval_result: LuaValue[]
  narrate_logs: string[]
  err: string
}
```
