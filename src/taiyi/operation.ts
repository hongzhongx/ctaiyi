import type { PublicKey } from '../crypto'
import type { Authority } from './account'
import type { Asset } from './asset'
import type { ChainProperties, HexBuffer } from './misc'

export type OperationName =
  | 'account_create' // 0
  | 'account_update' // 1

  | 'transfer' // 2
  | 'transfer_to_qi' // 3
  | 'withdraw_qi' // 4
  | 'set_withdraw_qi_route' // 5
  | 'delegate_qi' // 6

  | 'siming_update' // 7
  | 'siming_set_properties' // 8
  | 'account_siming_adore' // 9
  | 'account_siming_proxy' // 10
  | 'decline_adoring_rights' // 11

  | 'custom' // 12
  | 'custom_json' // 13

  | 'request_account_recovery' // 14
  | 'recover_account' // 15
  | 'change_recovery_account' // 16

  | 'claim_reward_balance' // 17

  // contract
  | 'create_contract' // 18
  | 'revise_contract' // 19
  | 'call_contract_function' // 20

  // nfa (non fungible asset)
  | 'create_nfa_symbol' // 21
  | 'create_nfa' // 22
  | 'transfer_nfa' // 23
  | 'approve_nfa_active' // 24
  | 'action_nfa' // 25

  // zone
  | 'create_zone' // 26

  // actor
  | 'create_actor_talent_rule' // 27
  | 'create_actor' // 28

export type VirtualOperationName =
  | 'hardfork' // 29
  | 'fill_qi_withdraw' // 30
  | 'return_qi_delegation' // 31
  | 'producer_reward' // 32

  | 'nfa_convert_resources' // 33
  | 'nfa_transfer' // 34
  | 'nfa_deposit_withdraw' // 35
  | 'reward_feigang' // 36
  | 'reward_cultivation' // 37

  | 'tiandao_year_change' // 38
  | 'tiandao_month_change' // 39
  | 'tiandao_time_change' // 40

  | 'actor_born' // 41
  | 'actor_talent_trigger' // 42
  | 'actor_movement' // 43
  | 'actor_grown' // 44

  | 'narrate_log' // 45

export interface Operation {
  0: OperationName | VirtualOperationName
  1: Record<string, any>
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
    fee: Asset | string
    creator: string
    new_account_name: string
    owner: Authority
    active: Authority
    posting: Authority
    memo_key: PublicKey | string
    json_metadata: string
  }
}

export interface AccountUpdateOperation extends Operation {
  0: 'account_update'
  1: {
    account: string
    owner?: Authority
    active?: Authority
    posting?: Authority
    memo_key?: PublicKey | string
    json_metadata?: string
  }
}

export interface TransferOperation extends Operation {
  0: 'transfer'
  1: {
    from: string
    to: string
    amount: Asset | string
    memo?: string
  }
}

export interface TransferToQiOperation extends Operation {
  0: 'transfer_to_qi'
  1: {
    from: string
    to: string
    amount: Asset | string
  }
}

export interface WithdrawQiOperation extends Operation {
  0: 'withdraw_qi'
  1: {
    from: string
    to: string
    amount: Asset | string
  }
}

export interface SetWithdrawQiRouteOperation extends Operation {
  0: 'set_withdraw_qi_route'
  1: {
    from_account: string
    to_account: string
    percent: number
    auto_vest: boolean
  }
}

export interface DelegateQiOperation extends Operation {
  0: 'delegate_qi'
  1: {
    delegator: string
    delegatee: string
    qi: Asset | string
  }
}

export interface SimingUpdateOperation extends Operation {
  0: 'siming_update'
  1: {
    owner: string
    url: string
    block_signing_key: PublicKey | string
    props: ChainProperties
    fee: Asset | string
  }
}

export interface SimingSetPropertiesOperation extends Operation {
  0: 'siming_set_properties'
  1: {
    owner: string
    props: ChainProperties
    /** 暂未使用  */
    extensions: Array<unknown>
  }
}

export interface AccountSimingAdoreOperation extends Operation {
  0: 'account_siming_adore'
  1: {
    amount: string
    siming: string
    approve: boolean
  }
}

export interface AccountSimingProxyOperation extends Operation {
  0: 'account_siming_proxy'
  1: {
    account: string
    proxy: string
  }
}

export interface DeclineAdoringRightsOperation extends Operation {
  0: 'decline_adoring_rights'
  1: {
    account: string
    /** 暂未使用  */
    extensions: Array<unknown>
  }
}

export interface CustomOperation extends Operation {
  0: 'custom'
  1: {
    required_auths: Array<string>
    id: number
    data: Uint8Array | HexBuffer
  }
}

export interface CustomJsonOperation extends Operation {
  0: 'custom_json'
  1: {
    required_auths: Array<string>
    required_posting_auths: Array<string>
    id: string
    json: string
  }
}

export interface RequestAccountRecoveryOperation extends Operation {
  0: 'request_account_recovery'
  1: {
    recovery_account: string
    account_to_recover: string
    new_owner_authority: Authority
    extensions: Array<unknown>
  }
}

export interface RecoverAccountOperation extends Operation {
  0: 'recover_account'
  1: {
    account_to_recover: string
    new_owner_authority: Authority
    recent_owner_authority: Authority
    extensions: Array<unknown>
  }
}

export interface ChangeRecoveryAccountOperation extends Operation {
  0: 'change_recovery_account'
  1: {
    account_to_recover: string
    new_recovery_account: string
    extensions: Array<unknown>
  }
}

export interface ClaimRewardBalanceOperation extends Operation {
  0: 'claim_reward_balance'
  1: {
    account: string
    reward_qi: Asset | string
    extensions: Array<unknown>
  }
}

export interface CreateContractOperation extends Operation {
  0: 'create_contract'
  1: {
    owner: string
    name: string
    code: string
    abi: string
    fee: Asset | string
  }
}

export interface ReviseContractOperation extends Operation {
  0: 'revise_contract'
  1: {
    owner: string
    name: string
    code: string
    abi: string
    fee: Asset | string
  }
}

export interface CallContractFunctionOperation extends Operation {
  0: 'call_contract_function'
  1: {
    caller: string
    contract: string
    function: string
    params: string
    fee: Asset | string
  }
}

export interface CreateNfaSymbolOperation extends Operation {
  0: 'create_nfa_symbol'
  1: {
    owner: string
    name: string
    maximum_supply: number
    json_metadata: string
  }
}

export interface CreateNfaOperation extends Operation {
  0: 'create_nfa'
  1: {
    creator: string
    symbol: string
    to: string
    uri: string
    json_metadata: string
  }
}

export interface TransferNfaOperation extends Operation {
  0: 'transfer_nfa'
  1: {
    from: string
    to: string
    token_id: number
    memo: string
  }
}

export interface ApproveNfaActiveOperation extends Operation {
  0: 'approve_nfa_active'
  1: {
    owner: string
    approved: string
    token_id: number
    approve: boolean
  }
}

export interface ActionNfaOperation extends Operation {
  0: 'action_nfa'
  1: {
    caller: string
    id: number
    action: string
    value_list: string[]
    extensions: unknown[]
  }
}

export interface CreateZoneOperation extends Operation {
  0: 'create_zone'
  1: {
    owner: string
    name: string
    json_metadata: string
  }
}

export interface CreateActorTalentRuleOperation extends Operation {
  0: 'create_actor_talent_rule'
  1: {
    owner: string
    name: string
    rule: string
  }
}

export interface CreateActorOperation extends Operation {
  0: 'create_actor'
  1: {
    fee: Asset | string
    creator: string
    family_name: string
    last_name: string
  }
}

export interface HardforkOperation extends Operation {
  0: 'hardfork'
  1: {
    hardfork_id: number
  }
}

export interface FillQiWithdrawOperation extends Operation {
  0: 'fill_qi_withdraw'
  1: {
    from_account: string
    to_account: string
    withdrawn: Asset | string
    deposited: Asset | string
  }
}

export interface ReturnQiDelegationOperation extends Operation {
  0: 'return_qi_delegation'
  1: {
    account: string
    return_qi_delegation: Asset | string
  }
}

export interface ProducerRewardOperation extends Operation {
  0: 'producer_reward'
  1: {
    producer: string
    qi_reward: Asset | string
  }
}

export interface NfaConvertResourcesOperation extends Operation {
  0: 'nfa_convert_resources'
  1: {
    owner: string
    token_id: number
    resources: string
  }
}

export interface NfaTransferOperation extends Operation {
  0: 'nfa_transfer'
  1: {
    from: string
    to: string
    token_id: number
    memo: string
  }
}

export interface NfaDepositWithdrawOperation extends Operation {
  0: 'nfa_deposit_withdraw'
  1: {
    owner: string
    token_id: number
    amount: Asset | string
  }
}

export interface RewardFeigangOperation extends Operation {
  0: 'reward_feigang'
  1: {
    account: string
    reward: Asset | string
  }
}

export interface RewardCultivationOperation extends Operation {
  0: 'reward_cultivation'
  1: {
    account: string
    reward: Asset | string
  }
}

export interface TiandaoYearChangeOperation extends Operation {
  0: 'tiandao_year_change'
  1: {
    year: number
  }
}

export interface TiandaoMonthChangeOperation extends Operation {
  0: 'tiandao_month_change'
  1: {
    month: number
  }
}

export interface TiandaoTimeChangeOperation extends Operation {
  0: 'tiandao_time_change'
  1: {
    time: number
  }
}

export interface ActorBornOperation extends Operation {
  0: 'actor_born'
  1: {
    actor_id: number
    owner: string
    json_metadata: string
  }
}

export interface ActorTalentTriggerOperation extends Operation {
  0: 'actor_talent_trigger'
  1: {
    actor_id: number
    talent: string
    params: string
  }
}

export interface ActorMovementOperation extends Operation {
  0: 'actor_movement'
  1: {
    actor_id: number
    from_zone: number
    to_zone: number
  }
}

export interface ActorGrownOperation extends Operation {
  0: 'actor_grown'
  1: {
    actor_id: number
    growth: string
  }
}

export interface NarrateLogOperation extends Operation {
  0: 'narrate_log'
  1: {
    narrator: string
    content: string
  }
}
