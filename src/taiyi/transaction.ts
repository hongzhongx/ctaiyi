import type { Operation } from './operation'

export interface Transaction {
  ref_block_num: number
  ref_block_prefix: number
  expiration: string
  operations: Operation[]
  extensions: any[]
}

export interface SignedTransaction extends Transaction {
  signatures: string[]
}

export interface TransactionConfirmation {
  id: string // transaction_id_type
  block_num: number // int32_t
  trx_num: number // int32_t
  expired: boolean
}

export interface AffectedContractNarrate {
  type: 'contract_narrate'
  value: {
    affected_account: string
    affected_nfa: number
    message: string
  }
}

export interface AffectedNfaAffected {
  type: 'nfa_affected'
  value: {
    affected_account: string
    affected_item: number
    action: string
  }
}

export type ContractAffectedNarrate = AffectedContractNarrate | AffectedNfaAffected

export interface TransactionBaseResult {
  type: 'base_result'
  value: {
    process_value: string
    relevant_datasize: number
  }
}

export interface TransactionContractResult {
  type: 'contract_result'
  value: {
    contract_name: string
    contract_affecteds: ContractAffectedNarrate[]
    existed_pv: boolean
    process_value: string
    relevant_datasize: number
  }
}

export type TransactionResult = TransactionBaseResult | TransactionContractResult
