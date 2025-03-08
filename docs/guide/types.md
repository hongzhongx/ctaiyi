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
import { AssetSymbol, SGTAsset } from '@taiyinet/ctaiyi'
// ---cut---
/**
 * 表示太乙资产的类，例如 `1.000 QI` 或 `12.112233 YANG`。
 */
declare class Asset implements SGTAsset {
  amount: string
  precision: number
  fai: `@@${string}`
  /**
   * 从字符串创建资产。
   * @param value 资产字符串，例如 `1.000 QI` 或 `12.112233 YANG`。
   * @returns 创建的资产实例。
   */
  static fromString(value: string): Asset
  /**
   * 从 bigint 创建资产。
   * @param amount 资产数量。
   * @param precision 资产精度。
   * @param fai 资产 identifier。
   * @returns 创建的资产实例。
   */
  static fromBigInt(amount: bigint, precision: number, fai: `@@${string}`): Asset
  /**
   * 从 SGTAsset 对象创建资产。
   * @param value SGTAsset 实例。
   * @returns 创建的资产实例。
   */
  static fromObject(value: SGTAsset): Asset
  static from(value: Asset): Asset
  static from(value: string | SGTAsset): Asset
  static from(value: number, symbol?: AssetSymbol): Asset
  constructor(amount: string, precision: number, fai: `@@${string}`)
  static isValidSymbol(symbol: any): symbol is AssetSymbol
  /**
   * 返回资产的精度。
   */
  static getPrecision(symbol: AssetSymbol): number
  /**
   * 返回资产的 identifier
   */
  static getIdentifier(symbol: AssetSymbol): `@@${string}`
  /**
   * 根据 identifier 返回资产的 symbol
   */
  static getSymbolByIdentifier(fai: `@@${string}`): AssetSymbol
  /**
   * 返回两个资产中较小的一个。
   */
  static min(a: Asset, b: Asset): Asset
  /**
   * 返回两个资产中较大的一个。
   */
  static max(a: Asset, b: Asset): Asset
  /**
   * 返回一个新实例为两个资产相加。
   */
  add(other: Asset): Asset
  /**
   * 返回一个新实例为两个资产相减。
   */
  subtract(other: Asset): Asset
  /**
   * 返回一个新实例为两个资产相乘。
   */
  multiply(other: Asset): Asset
  /**
   * 返回一个新实例为两个资产相除。
   */
  divide(other: Asset): Asset
  toString(): string
  toJSON(): {
    amount: string
    precision: number
    fai: `@@${string}`
  }
}
```

## FaiAsset

```ts twoslash
declare interface SGTAsset {
  amount: bigint | string
  precision: number
  fai: `@@${string}`
}
```

## Account

```ts twoslash
import { Authority, LegacyAsset, MaterialAssets } from '@taiyinet/ctaiyi'
// ---cut---
interface Account extends MaterialAssets {
  id: number
  name: string
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
  balance: LegacyAsset
  reward_yang_balance: LegacyAsset
  reward_qi_balance: LegacyAsset
  reward_feigang_balance: LegacyAsset
  qi: LegacyAsset
  delegated_qi: LegacyAsset
  received_qi: LegacyAsset
  qi_withdraw_rate: LegacyAsset
  next_qi_withdrawal_time: string
  withdrawn: number
  to_withdraw: number
  withdraw_routes: number
  proxied_vsf_adores: number[]
  simings_adored_for: number
  qi_balance: LegacyAsset
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
import { LegacyAsset } from '@taiyinet/ctaiyi'
// ---cut---
declare interface MaterialAssets {
  gold: LegacyAsset
  food: LegacyAsset
  wood: LegacyAsset
  fabric: LegacyAsset
  herb: LegacyAsset
}
```

## ChainProperties

```ts twoslash
import { LegacyAsset } from '@taiyinet/ctaiyi'
// ---cut---
interface ChainProperties {
  /**
   * 这笔费用以 YANG 支付，会为新账户兑换成 QI。
   * 没有 QI 的账户无法获得使用配额，因此毫无影响力。
   * 这笔最低费用要求所有账户对网络做出一定的投入，其中包括投票及进行交易的能力。
   */
  account_creation_fee: LegacyAsset
  /**
   * 司命投票针对的是最大区块大小，网络利用该参数来调整速率限制和容量。
   */
  maximum_block_size: number
}
```

## DynamicGlobalProperties

```ts twoslash
import { LegacyAsset } from '@taiyinet/ctaiyi'
// ---cut---
interface DynamicGlobalProperties {
  id: number
  head_block_number: number
  head_block_id: string
  time: string
  /** 当前总等价阳寿供应量（包含真气、物质所有的等价阳寿总量） */
  current_supply: LegacyAsset
  /** 当前总的真气（自由真气） */
  total_qi: LegacyAsset
  /** 当前总的真气（自由真气） */
  pending_rewarded_qi: LegacyAsset
  pending_rewarded_feigang: LegacyAsset
  pending_cultivation_qi: LegacyAsset
  /** 当前总的金石（包括NFA内含物质） */
  total_gold: LegacyAsset
  /** 当前总的食物（包括NFA内含物质） */
  total_food: LegacyAsset
  /** 当前总的木材（包括NFA内含物质） */
  total_wood: LegacyAsset
  /** 当前总的织物（包括NFA内含物质） */
  total_fabric: LegacyAsset
  /** 当前总的药材（包括NFA内含物质） */
  total_herb: LegacyAsset
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
import { LegacyAsset } from '@taiyinet/ctaiyi'
// ---cut---
interface QiDelegation {
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
  qi: string
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
import { LegacyAsset, LuaValue } from '@taiyinet/ctaiyi'
// ---cut---
interface Nfa {
  id: number
  symbol: string
  main_contract: string
  children: number[]
  contract_data: [{
    key: LuaValue
  }, LuaValue][]
  created_time: string
  next_tick_time: string
  creator_account: string
  owner_account: string
  active_account: string
  parent: string
  cultivation_value: number
  debt_contract: string
  debt_value: number
  qi: LegacyAsset
  fabric: LegacyAsset
  food: LegacyAsset
  gold: LegacyAsset
  herb: LegacyAsset
  wood: LegacyAsset
  material_fabric: LegacyAsset
  material_food: LegacyAsset
  material_gold: LegacyAsset
  material_herb: LegacyAsset
  material_wood: LegacyAsset
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
