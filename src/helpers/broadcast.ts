import type { Client } from './../client'

import type { AuthorityType } from './../taiyi/account'
import type {
  AccountCreateOperation,
  AccountUpdateOperation,
  CustomJsonOperation,
  DelegateQiOperation,
  Operation,
  TransferOperation,
} from './../taiyi/operation'
import type { SignedTransaction, Transaction, TransactionConfirmation } from './../taiyi/transaction'
import * as assert from 'assert'
import { cryptoUtils, PrivateKey, PublicKey } from './../crypto'
import { Authority } from './../taiyi/account'
import { Asset } from './../taiyi/asset'

export interface CreateAccountOptions {
  /**
   * Username for the new account.
   */
  username: string
  /**
   * Password for the new account, if set, all keys will be derived from this.
   */
  password?: string
  /**
   * Account authorities, used to manually set account keys.
   * Can not be used together with the password option.
   */
  auths?: {
    owner: AuthorityType | string | PublicKey
    active: AuthorityType | string | PublicKey
    posting: AuthorityType | string | PublicKey
    memoKey: PublicKey | string
  }
  /**
   * Creator account, fee will be deducted from this and the key to sign
   * the transaction must be the creators active key.
   */
  creator: string
  /**
   * Account creation fee. If omitted fee will be set to lowest possible.
   */
  fee?: string | Asset | number
  /**
   * Optional account meta-data.
   */
  metadata?: { [key: string]: any }
}

export class BroadcastAPI {
  /**
   * How many milliseconds in the future to set the expiry time to when
   * broadcasting a transaction, defaults to 1 minute.
   */
  public expireTime = 60 * 1000

  constructor(readonly client: Client) {}

  /**
   * Broadcast a transfer.
   * @param data The transfer operation payload.
   * @param key Private active key of sender.
   */
  public async transfer(data: TransferOperation[1], key: PrivateKey) {
    const op: Operation = ['transfer', data]
    return this.sendOperations([op], key)
  }

  /**
   * Broadcast custom JSON.
   * @param data The custom_json operation payload.
   * @param key Private posting or active key.
   */
  public async json(data: CustomJsonOperation[1], key: PrivateKey) {
    const op: Operation = ['custom_json', data]
    return this.sendOperations([op], key)
  }

  /**
   * Create a new account on testnet.
   * @param options New account options.
   * @param key Private active key of account creator.
   */
  public async createTestAccount(options: CreateAccountOptions, key: PrivateKey) {
    assert(global.hasOwnProperty('it'), 'helper to be used only for mocha tests')

    const { username, metadata, creator } = options

    const prefix = this.client.addressPrefix
    let owner: Authority, active: Authority, posting: Authority, memo_key: PublicKey
    if (options.password) {
      const ownerKey = PrivateKey.fromLogin(username, options.password, 'owner').createPublic(prefix)
      owner = Authority.from(ownerKey)
      const activeKey = PrivateKey.fromLogin(username, options.password, 'active').createPublic(prefix)
      active = Authority.from(activeKey)
      const postingKey = PrivateKey.fromLogin(username, options.password, 'posting').createPublic(prefix)
      posting = Authority.from(postingKey)
      memo_key = PrivateKey.fromLogin(username, options.password, 'memo').createPublic(prefix)
    }
    else if (options.auths) {
      owner = Authority.from(options.auths.owner)
      active = Authority.from(options.auths.active)
      posting = Authority.from(options.auths.posting)
      memo_key = PublicKey.from(options.auths.memoKey)
    }
    else {
      throw new Error('Must specify either password or auths')
    }

    let { fee } = options

    fee = Asset.from(fee || 0, 'YANG')

    if (fee.amount > 0) {
      const chainProps = await this.client.database.getChainProperties()
      const creationFee = Asset.from(chainProps.account_creation_fee)
      if (fee.amount !== creationFee.amount) {
        throw new Error(`Fee must be exactly ${creationFee.toString()}`)
      }
    }

    const create_op: AccountCreateOperation = [
      'account_create',
      {
        active,
        creator,
        fee,
        json_metadata: metadata ? JSON.stringify(metadata) : '',
        memo_key,
        new_account_name: username,
        owner,
        posting,
      },
    ]

    const ops: any[] = [create_op]

    return this.sendOperations(ops, key)
  }

  /**
   * Update account.
   * @param data The account_update payload.
   * @param key The private key of the account affected, should be the corresponding
   *            key level or higher for updating account authorities.
   */
  public async updateAccount(data: AccountUpdateOperation[1], key: PrivateKey) {
    const op: Operation = ['account_update', data]
    return this.sendOperations([op], key)
  }

  /**
   * Delegate qi from one account to the other. The qi are still owned
   * by the original account, but siming adore rights and bandwidth allocation are transferred
   * to the receiving account. This sets the delegation to `qi`, increasing it or
   * decreasing it as needed. (i.e. a delegation of 0 removes the delegation)
   *
   * When a delegation is removed the qi are placed in limbo for a week to prevent a satoshi
   * of QI from adoring on the same siming twice.
   *
   * @param options Delegation options.
   * @param key Private active key of the delegator.
   */
  public async delegateQi(options: DelegateQiOperation[1], key: PrivateKey) {
    const op: Operation = ['delegate_qi', options]
    return this.sendOperations([op], key)
  }

  /**
   * Sign and broadcast transaction with operations to the network. Throws if the transaction expires.
   * @param operations List of operations to send.
   * @param key Private key(s) used to sign transaction.
   */
  public async sendOperations(operations: Operation[], key: PrivateKey | PrivateKey[]): Promise<TransactionConfirmation> {
    const props = await this.client.database.getDynamicGlobalProperties()

    const ref_block_num = props.head_block_number & 0xFFFF
    const ref_block_prefix = Buffer.from(props.head_block_id, 'hex').readUInt32LE(4)
    const expiration = new Date(new Date(`${props.time}Z`).getTime() + this.expireTime).toISOString().slice(0, -5)
    const extensions = []

    const tx: Transaction = {
      expiration,
      extensions,
      operations,
      ref_block_num,
      ref_block_prefix,
    }

    const result = await this.send(this.sign(tx, key))
    assert(result.expired === false, 'transaction expired')

    return result
  }

  /**
   * Sign a transaction with key(s).
   */
  public sign(transaction: Transaction, key: PrivateKey | PrivateKey[]): SignedTransaction {
    return cryptoUtils.signTransaction(transaction, key, this.client.chainId)
  }

  /**
   * Broadcast a signed transaction to the network.
   */
  public async send(transaction: SignedTransaction): Promise<TransactionConfirmation> {
    return this.call('broadcast_transaction_synchronous', [transaction])
  }

  /**
   * Convenience for calling `baiyujing_api`.
   */
  public call(method: string, params?: any[]) {
    return this.client.call('baiyujing_api', method, params)
  }
}
