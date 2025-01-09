import * as ByteBuffer from 'bytebuffer'

import {PublicKey} from './../crypto'
import {Asset} from './asset'

export interface AuthorityType {
    weight_threshold: number // uint32_t
    account_auths: Array<[string, number]> // flat_map< account_name_type, uint16_t >
    key_auths: Array<[string | PublicKey, number]>// flat_map< public_key_type, uint16_t >
}

export class Authority implements AuthorityType {

    /**
     * Convenience to create a new instance from PublicKey or authority object.
     */
    public static from(value: string | PublicKey | AuthorityType) {
        if (value instanceof Authority) {
            return value
        } else if (typeof value === 'string' || value instanceof PublicKey) {
            return new Authority({
                account_auths: [],
                key_auths: [[value, 1]],
                weight_threshold: 1,
            })
        } else {
            return new Authority(value)
        }
    }

    public weight_threshold: number
    public account_auths: Array<[string, number]>
    public key_auths: Array<[string | PublicKey, number]>

    constructor({weight_threshold, account_auths, key_auths}: AuthorityType) {
        this.weight_threshold = weight_threshold
        this.account_auths = account_auths
        this.key_auths = key_auths
    }
}

export interface Account {
    id: number // account_id_type
    name: string // account_name_type
    owner: Authority
    active: Authority
    posting: Authority
    memo_key: string // public_key_type
    json_metadata: string
    proxy: string // account_name_type
    last_owner_update: string // time_point_sec
    last_account_update: string // time_point_sec
    created: string // time_point_sec
    recovery_account: string // account_name_type
    last_account_recovery: string // time_point_sec
    balance: string | Asset
    reward_yang_balance: string | Asset
    reward_qi_balance: string | Asset
    qi: string | Asset
    delegated_qi: string | Asset
    received_qi: string | Asset
    qi_withdraw_rate: string | Asset
    next_qi_withdrawal_time: string // time_point_sec
    withdrawn: number | string // share_type
    to_withdraw: number | string // share_type
    withdraw_routes: number // uint16_t
    proxied_vsf_adores: number[] // vector< share_type >
    simings_voted_for: number // uint16_t
}

export interface ExtendedAccount extends Account {
    /**
     * Transfer to/from vesting.
     */
    transfer_history: any[] // map<uint64_t,applied_operation>
}
