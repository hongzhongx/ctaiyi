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
