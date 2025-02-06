import type { Asset } from './asset'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'

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

  /** 委托返回周期 */
  delegation_return_period: number
  /** 内容奖励阳百分比 */
  content_reward_yang_percent: number
  /** 内容奖励气基金百分比 */
  content_reward_qi_fund_percent: number

}
