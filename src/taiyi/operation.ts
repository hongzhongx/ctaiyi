import {PublicKey} from './../crypto'
import {AuthorityType} from './account'
import {Asset, Price, PriceType} from './asset'
import {SignedBlockHeader} from './block'
import {ChainProperties, HexBuffer} from './misc'

/**
 * Operation name.
 */
export type OperationName = // <id>
    | 'account_create' // 0
    | 'account_update' // 1
    | 'account_siming_proxy' // 10
    | 'account_siming_adore' // 9
    | 'change_recovery_account' // 16
    | 'claim_reward_balance' // 17
    | 'custom' // 12
    | 'custom_json' // 13
    | 'decline_adoring_rights' // 11
    | 'delegate_qi' // 6
    | 'recover_account' // 15
    | 'request_account_recovery' // 14
    | 'set_withdraw_qi_route' // 5
    | 'transfer' // 2
    | 'transfer_to_qi' // 3
    | 'withdraw_qi' // 4
    | 'siming_set_properties' // 8
    | 'siming_update' // 7

/**
 * Virtual operation name.
 */
export type VirtualOperationName = // <id>
    | 'fill_qi_withdraw' // 30
    | 'hardfork' // 29
    | 'return_qi_delegation' // 31

/**
 * Generic operation.
 */
export interface Operation {
    0: OperationName | VirtualOperationName
    1: {[key: string]: any}
}

export interface AppliedOperation {
   trx_id: string
   block: number
   trx_in_block: number
   op_in_trx: number
   virtual_op: number
   timestamp: string
   op: Operation
}

export interface AccountCreateOperation extends Operation {
    0: 'account_create'
    1: {
        fee: string | Asset
        creator: string // account_name_type
        new_account_name: string // account_name_type
        owner: AuthorityType
        active: AuthorityType
        posting: AuthorityType
        memo_key: string | PublicKey // public_key_type
        json_metadata: string
    }
}

export interface AccountUpdateOperation extends Operation {
    0: 'account_update'
    1: {
        account: string // account_name_type
        owner?: AuthorityType // optional< authority >
        active?: AuthorityType // optional< authority >
        posting?: AuthorityType // optional< authority >
        memo_key: string | PublicKey // public_key_type
        json_metadata: string
    }
}

export interface AccountSimingProxyOperation extends Operation {
    0: 'account_siming_proxy'
    1: {
        account: string // account_name_type
        proxy: string // account_name_type
    }
}

export interface AccountSimingAdoreOperation extends Operation {
    0: 'account_siming_adore'
    1: {
        account: string // account_name_type
        siming: string // account_name_type
        approve: boolean
    }
}

/**
 * Each account lists another account as their recovery account.
 * The recovery account has the ability to create account_recovery_requests
 * for the account to recover. An account can change their recovery account
 * at any time with a 30 day delay. This delay is to prevent
 * an attacker from changing the recovery account to a malicious account
 * during an attack. These 30 days match the 30 days that an
 * owner authority is valid for recovery purposes.
 *
 * On account creation the recovery account is set either to the creator of
 * the account (The account that pays the creation fee and is a signer on the transaction)
 * or to the empty string if the account was mined. An account with no recovery
 * has the top adored siming as a recovery account, at the time the recover
 * request is created. Note: This does mean the effective recovery account
 * of an account with no listed recovery account can change at any time as
 * siming adore weights. The top adored siming is explicitly the most trusted
 * siming according to stake.
 */
export interface ChangeRecoveryAccountOperation extends Operation {
    0: 'change_recovery_account'
    1: {
        /**
         * The account that would be recovered in case of compromise.
         */
        account_to_recover: string // account_name_type
        /**
         * The account that creates the recover request.
         */
        new_recovery_account: string // account_name_type
        /**
         * Extensions. Not currently used.
         */
        extensions: any[] // extensions_type
    }
}

export interface ClaimRewardBalanceOperation extends Operation {
    0: 'claim_reward_balance'
    1: {
        account: string // account_name_type
        reward_yang: string | Asset
        reward_qi: string | Asset
        reward_feigang: string | Asset
    }
}

export interface CustomOperation extends Operation {
    0: 'custom'
    1: {
        required_auths: string[]
        id: number // uint16
        data: Buffer | HexBuffer | number[]
    }
}

export interface CustomJsonOperation extends Operation {
    0: 'custom_json'
    1: {
        required_auths: string[] // flat_set< account_name_type >
        required_posting_auths: string[] // flat_set< account_name_type >
        /**
         * ID string, must be less than 32 characters long.
         */
        id: string
        /**
         * JSON encoded string, must be valid JSON.
         */
        json: string
    }
}

export interface DeclineAdoringRightsOperation extends Operation {
    0: 'decline_adoring_rights'
    1: {
        account: string // account_name_type
        decline: boolean
    }
}

export interface DelegateQiOperation extends Operation {
    0: 'delegate_qi'
    1: {
        /**
         * The account delegating qi.
         */
        delegator: string // account_name_type
        /**
         * The account receiving qi.
         */
        delegatee: string // account_name_type
        /**
         * The amount of qi delegated.
         */
        qi: string | Asset
    }
}

/**
 * Recover an account to a new authority using a previous authority and verification
 * of the recovery account as proof of identity. This operation can only succeed
 * if there was a recovery request sent by the account's recover account.
 *
 * In order to recover the account, the account holder must provide proof
 * of past ownership and proof of identity to the recovery account. Being able
 * to satisfy an owner authority that was used in the past 30 days is sufficient
 * to prove past ownership. The get_owner_history function in the database API
 * returns past owner authorities that are valid for account recovery.
 *
 * Proving identity is an off chain contract between the account holder and
 * the recovery account. The recovery request contains a new authority which
 * must be satisfied by the account holder to regain control. The actual process
 * of verifying authority may become complicated, but that is an application
 * level concern, not a blockchain concern.
 *
 * This operation requires both the past and future owner authorities in the
 * operation because neither of them can be derived from the current chain state.
 * The operation must be signed by keys that satisfy both the new owner authority
 * and the recent owner authority. Failing either fails the operation entirely.
 *
 * If a recovery request was made inadvertantly, the account holder should
 * contact the recovery account to have the request deleted.
 *
 * The two setp combination of the account recovery request and recover is
 * safe because the recovery account never has access to secrets of the account
 * to recover. They simply act as an on chain endorsement of off chain identity.
 * In other systems, a fork would be required to enforce such off chain state.
 * Additionally, an account cannot be permanently recovered to the wrong account.
 * While any owner authority from the past 30 days can be used, including a compromised
 * authority, the account can be continually recovered until the recovery account
 * is confident a combination of uncompromised authorities were used to
 * recover the account. The actual process of verifying authority may become
 * complicated, but that is an application level concern, not the blockchain's
 * concern.
 */
export interface RecoverAccountOperation extends Operation {
    0: 'recover_account'
    1: {
        /**
         * The account to be recovered.
         */
        account_to_recover: string // account_name_type
        /**
         * The new owner authority as specified in the request account recovery operation.
         */
        new_owner_authority: AuthorityType
        /**
         * A previous owner authority that the account holder will use to prove
         * past ownership of the account to be recovered.
         */
        recent_owner_authority: AuthorityType
        /**
         * Extensions. Not currently used.
         */
        extensions: any[] // extensions_type
    }
}

/**
 * All account recovery requests come from a listed recovery account. This
 * is secure based on the assumption that only a trusted account should be
 * a recovery account. It is the responsibility of the recovery account to
 * verify the identity of the account holder of the account to recover by
 * whichever means they have agreed upon. The blockchain assumes identity
 * has been verified when this operation is broadcast.
 *
 * This operation creates an account recovery request which the account to
 * recover has 24 hours to respond to before the request expires and is
 * invalidated.
 *
 * There can only be one active recovery request per account at any one time.
 * Pushing this operation for an account to recover when it already has
 * an active request will either update the request to a new new owner authority
 * and extend the request expiration to 24 hours from the current head block
 * time or it will delete the request. To cancel a request, simply set the
 * weight threshold of the new owner authority to 0, making it an open authority.
 *
 * Additionally, the new owner authority must be satisfiable. In other words,
 * the sum of the key weights must be greater than or equal to the weight
 * threshold.
 *
 * This operation only needs to be signed by the the recovery account.
 * The account to recover confirms its identity to the blockchain in
 * the recover account operation.
 */
export interface RequestAccountRecoveryOperation extends Operation {
    0: 'request_account_recovery'
    1: {
        /**
         * The recovery account is listed as the recovery account on the account to recover.
         */
        recovery_account: string // account_name_type
        /**
         * The account to recover. This is likely due to a compromised owner authority.
         */
        account_to_recover: string // account_name_type
        /**
         * The new owner authority the account to recover wishes to have. This is secret
         * known by the account to recover and will be confirmed in a recover_account_operation.
         */
        new_owner_authority: AuthorityType
        /**
         * Extensions. Not currently used.
         */
        extensions: any[] // extensions_type
    }
}

/**
 * Allows an account to setup a qi withdraw but with the additional
 * request for the funds to be transferred directly to another account's
 * balance rather than the withdrawing account. In addition, those funds
 * can be immediately vested again, circumventing the conversion from
 * qi to yang and back, guaranteeing they maintain their value.
 */
export interface SetWithdrawQiOperation extends Operation {
    0: 'set_withdraw_qi_route'
    1: {
        from_account: string // account_name_type
        to_account: string // account_name_type
        percent: number // uint16_t (100% = TAIYI_100_PERCENT = 10000)
        auto_vest: boolean
    }
}

/**
 * Transfers YANG from one account to another.
 */
export interface TransferOperation extends Operation {
    0: 'transfer'
    1: {
        /**
         * Sending account name.
         */
        from: string // account_name_type
        /**
         * Receiving account name.
         */
        to: string // account_name_type
        /**
         * Amount of YANG or GOLD... to send.
         */
        amount: string | Asset
        /**
         * Plain-text note attached to transaction.
         */
        memo: string
    }
}

/**
 * This operation converts YANG into Qi at
 * the current exchange rate. With this operation it is possible to
 * give another account qi so that faucets can
 * pre-fund new accounts with qi.
 * (A.k.a. Powering Up)
 */
export interface TransferToQiOperation extends Operation {
    0: 'transfer_to_qi'
    1: {
        from: string // account_name_type
        to: string // account_name_type
        /**
         * Amount to power up, must be YANG.
         */
        amount: string | Asset
    }
}

/**
 * At any given point in time an account can be withdrawing from their
 * qi. A user may change the number of qi they wish to
 * cash out at any time between 0 and their total qi stake.
 *
 * After applying this operation, qi will be withdrawn
 * at a rate of qi/104 per week for two years starting
 * one week after this operation is included in the blockchain.
 *
 * This operation is not valid if the user has no qi.
 * (A.k.a. Powering Down)
 */
export interface WithdrawQiOperation extends Operation {
    0: 'withdraw_qi'
    1: {
        account: string // account_name_type
        /**
         * Amount to power down, must be QI.
         */
        qi: string | Asset
    }
}

/**
 * Users who wish to become a siming must pay a fee acceptable to
 * the current simings to apply for the position and allow adoring
 * to begin.
 *
 * If the owner isn't a siming they will become a siming.  Simings
 * are charged a fee equal to 1 weeks worth of siming pay which in
 * turn is derived from the current qi supply.  The fee is
 * only applied if the owner is not already a siming.
 *
 * If the block_signing_key is null then the siming is removed from
 * contention.  The network will pick the top 21 simings for
 * producing blocks.
 */
export interface SimingUpdateOperation extends Operation {
    0: 'siming_update'
    1: {
        owner: string // account_name_type
        /**
         * URL for simming, usually a link to a post in the siming-category tag.
         */
        url: string
        block_signing_key: string | PublicKey | null // public_key_type
        props: ChainProperties
        /**
         * The fee paid to register a new siming, should be 10x current block production pay.
         */
        fee: string | Asset
    }
}

export interface SimingSetPropertiesOperation extends Operation {
    0: 'siming_set_properties'
    1: {
        owner: string
        props: Array<[string, Buffer]>
        extensions: any[]
    }
}
