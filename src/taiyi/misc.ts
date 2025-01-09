import { Account } from './account'
import {Asset, Price} from './asset'

/**
 * Large number that may be unsafe to represent natively in JavaScript.
 */
export type Bignum = string

/**
 * Buffer wrapper that serializes to a hex-encoded string.
 */
export class HexBuffer {

    /**
     * Convenience to create a new HexBuffer, does not copy data if value passed is already a buffer.
     */
    public static from(value: Buffer | HexBuffer | number[] | string) {
        if (value instanceof HexBuffer) {
            return value
        } else if (value instanceof Buffer) {
            return new HexBuffer(value)
        } else if (typeof value === 'string') {
            return new HexBuffer(Buffer.from(value, 'hex'))
        } else {
            return new HexBuffer(Buffer.from(value))
        }
    }

    constructor(public buffer: Buffer) {}

    public toString(encoding = 'hex') {
        return this.buffer.toString(encoding)
    }

    public toJSON() {
        return this.toString()
    }

}

/**
 * Chain roperties that are decided by the simings.
 */
export interface ChainProperties {
    /**
     * This fee, paid in YANG, is converted into QI for the new account. Accounts
     * without qi cannot earn usage rations and therefore are powerless. This minimum
     * fee requires all accounts to have some kind of commitment to the network that includes the
     * ability to vote and make transactions.
     */
    account_creation_fee: string | Asset
    /**
     * This simings vote for the maximum_block_size which is used by the network
     * to tune rate limiting and capacity.
     */
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
 * Node state.
 */
export interface DynamicGlobalProperties {
    id: number
    /**
     * Current block height.
     */
    head_block_number: number
    head_block_id: string
    /**
     * UTC Server time, e.g. 2020-01-15T00:42:00
     */
    time: string
    /**
     * Currently elected siming.
     */
    current_siming: string

    current_supply: Asset | string

    /**
     * Total asset held in confidential balances.
     */
    total_qi: Asset | string
    pending_rewarded_qi: Asset | string
    pending_rewarded_feigang: Asset | string
    pending_cultivation_qi: Asset | string

    total_gold: Asset | string
    total_food: Asset | string
    total_wood: Asset | string
    total_fabric: Asset | string
    total_herb: Asset | string

    /**
     * Maximum block size is decided by the set of active simings which change every round.
     * Each siming posts what they think the maximum size should be as part of their siming
     * properties, the median size is chosen to be the maximum block size for the round.
     *
     * @note the minimum value for maximum_block_size is defined by the protocol to prevent the
     * network from getting stuck by simings attempting to set this too low.
     */
    maximum_block_size: number
    /**
     * The current absolute slot number. Equal to the total
     * number of slots since genesis. Also equal to the total
     * number of missed slots plus head_block_number.
     */
    current_aslot: number
    /**
     * Used to compute siming participation.
     */
    recent_slots_filled: Bignum
    participation_count: number
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
