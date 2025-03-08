import type { MaterialAssets, SGTAsset } from './asset'
import type { AppliedOperation } from './operation'
import { PublicKey } from './../crypto'

export interface AuthorityType {
  weight_threshold: number // uint32_t
  account_auths: Array<[string, number]> // flat_map< account_name_type, uint16_t >
  key_auths: Array<[string | PublicKey, number]>// flat_map< public_key_type, uint16_t >
}

export class Authority implements AuthorityType {
  /**
   * 从公钥或权限对象创建新实例的便捷方法。
   */
  public static from(value: string | PublicKey | AuthorityType) {
    if (value instanceof Authority) {
      return value
    }
    else if (typeof value === 'string' || value instanceof PublicKey) {
      return new Authority({
        account_auths: [],
        key_auths: [[value, 1]],
        weight_threshold: 1,
      })
    }
    else {
      return new Authority(value)
    }
  }

  public weight_threshold: number
  public account_auths: Array<[string, number]>
  public key_auths: Array<[string, number]>

  constructor({ weight_threshold, account_auths, key_auths }: AuthorityType) {
    this.weight_threshold = weight_threshold
    this.account_auths = account_auths
    this.key_auths = key_auths.map(([key, weight]) => [key.toString(), weight])
  }
}

export interface Account extends MaterialAssets {
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

  balance: SGTAsset | string
  reward_yang_balance: SGTAsset | string
  reward_qi_balance: SGTAsset | string
  reward_feigang_balance: SGTAsset | string
  qi: SGTAsset | string
  delegated_qi: SGTAsset | string
  received_qi: SGTAsset | string
  qi_withdraw_rate: SGTAsset | string

  next_qi_withdrawal_time: string
  withdrawn: number
  to_withdraw: number
  withdraw_routes: number

  proxied_vsf_adores: number[]
  simings_adored_for: number

  qi_balance: SGTAsset | string
}

export interface ExtendedAccount extends Account {
  transfer_history: [nonce: number, AppliedOperation][]
  other_history: [nonce: number, AppliedOperation][]
  siming_adores: [nonce: number, AppliedOperation][]
}
