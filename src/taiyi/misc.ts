import type { Account } from './account'
import type { LegacyAsset } from './asset'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { Asset, Price } from './asset'

/**
 * 一个包装器，用于将数据序列化为十六进制编码的字符串。
 */
export class HexBuffer {
  /**
   * 创建一个新的 {@link HexBuffer}，如果传递的值已经是 {@link HexBuffer} 实例，则不复制数据。
   */
  public static from(value: Uint8Array | HexBuffer | number[] | string) {
    if (value instanceof HexBuffer) {
      return value
    }
    else if (value instanceof Uint8Array) {
      return new HexBuffer(value)
    }
    else if (typeof value === 'string') {
      return new HexBuffer(hexToBytes(value))
    }
    else {
      return new HexBuffer(Uint8Array.from(value))
    }
  }

  constructor(public buffer: Uint8Array) { }

  public toString() {
    return bytesToHex(this.buffer)
  }

  public toJSON() {
    return this.toString()
  }
}

export interface ChainProperties {
  /**
   * 这笔费用以 YANG 支付，会为新账户兑换成 QI。
   * 没有 QI 的账户无法获得使用配额，因此毫无影响力。
   * 这笔最低费用要求所有账户对网络做出一定的投入，其中包括投票及进行交易的能力。
   */
  account_creation_fee: LegacyAsset
  /**
   * 司命投票针对的是最大区块大小，网络利用该参数来调整速率限制和容量。
   */
  maximum_block_size: number // uint32_t
}

export interface QiDelegation {
  /**
   * 委托 ID。
   */
  id: number // id_type
  /**
   * 向受托人（接受委托者）委托 QI 的账户。
   */
  delegator: string // account_name_type
  /**
   * 从委托者处接收 QI 的账户
   */
  delegatee: string // account_name_type
  /**
   * 委托的 QI 数量。
   */
  qi: string
  /**
   * 最早可以移除委托的时间。
   */
  min_delegation_time: string // time_point_sec
}

/**
 * 节点状态
 */
export interface DynamicGlobalProperties {
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

/**
 * Return the qi price.
 */
export function getQiPrice(): Price {
  return new Price(Asset.from(1, 'YANG'), Asset.from(1, 'QI'))
}

/**
 * 返回指定账户的 QI 余额。
 *
 * @param account 要获取 QI 余额的账户。
 * @param subtract_delegated 是否减去委托出去的 QI。
 * @param add_received 是否加上接收到的 QI。
 */
export function getQi(account: Account, subtract_delegated: boolean = true, add_received: boolean = true) {
  let qi = Asset.from(account.qi)
  const qi_delegated = Asset.from(account.delegated_qi)
  const qi_received = Asset.from(account.received_qi)
  const withdraw_rate = Asset.from(account.qi_withdraw_rate)

  const to_withdraw = Asset.from(account.to_withdraw)
  const withdrawn = Asset.from(account.withdrawn)

  const already_withdrawn = to_withdraw.subtract(withdrawn)
  const withdraw_qi = Asset.min(withdraw_rate, already_withdrawn)
  qi = qi.subtract(withdraw_qi)

  if (subtract_delegated) {
    qi = qi.subtract(qi_delegated)
  }
  if (add_received) {
    qi = qi.add(qi_received)
  }

  return qi.amount
}
