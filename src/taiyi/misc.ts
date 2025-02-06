import type { Account } from './account'
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
  account_creation_fee: string | Asset
  maximum_block_size: number // uint32_t
}

export interface QiDelegation {
  /**
   * Delegation id.
   */
  id: number // id_type
  /**
   * Account that is delegating qi to delegatee.
   */
  delegator: string // account_name_type
  /**
   * Account that is receiving qi from delegator.
   */
  delegatee: string // account_name_type
  /**
   * Amount of QI delegated.
   */
  qi: Asset | string
  /**
   * Earliest date delegation can be removed.
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

/**
 * Return the qi price.
 */
export function getQiPrice(): Price {
  return new Price(new Asset(1, 'YANG'), new Asset(1, 'QI'))
}

/**
 * Returns the qi of specified account. Default: Subtract delegated & add received
 */
export function getQi(account: Account, subtract_delegated: boolean = true, add_received: boolean = true) {
  let qi: Asset = Asset.from(account.qi)
  const qi_delegated: Asset = Asset.from(account.delegated_qi)
  const qi_received: Asset = Asset.from(account.received_qi)
  const withdraw_rate: Asset = Asset.from(account.qi_withdraw_rate)
  const already_withdrawn = (Number(account.to_withdraw) - Number(account.withdrawn)) / 1000000
  const withdraw_qi = Math.min(withdraw_rate.amount, already_withdrawn)
  qi = qi.subtract(withdraw_qi)

  if (subtract_delegated) {
    qi = qi.subtract(qi_delegated)
  }
  if (add_received) {
    qi = qi.add(qi_received)
  }

  return qi.amount
}
