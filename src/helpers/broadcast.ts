import type { Client } from '../client'

import type { AuthorityType } from '../taiyi/account'
import type {
  AccountCreateOperation,
  AccountUpdateOperation,
  CustomJsonOperation,
  DelegateQiOperation,
  Operation,
  TransferOperation,
} from '../taiyi/operation'
import type { SignedTransaction, Transaction, TransactionConfirmation } from '../taiyi/transaction'
import { hexToBytes } from '@noble/hashes/utils'

import assert from 'tiny-invariant'
import { cryptoUtils, PrivateKey, PublicKey } from '../crypto'
import { Authority } from '../taiyi/account'
import { Asset } from '../taiyi/asset'

export interface CreateAccountOptions {
  /**
   * 新账户的用户名
   */
  username: string
  /**
   * 新账户的密码，如果设置了密码，所有密钥都将从此密码派生
   */
  password?: string
  /**
   * 账户权限，用于手动设置账户密钥
   * 不能与密码选项一起使用
   */
  auths?: {
    owner: AuthorityType | string | PublicKey
    active: AuthorityType | string | PublicKey
    posting: AuthorityType | string | PublicKey
    memoKey: PublicKey | string
  }
  /**
   * 创建者账户，费用将从此账户扣除
   * 签署交易的密钥必须是创建者的活动密钥
   */
  creator: string
  /**
   * 账户创建费用。如果省略，费用将设置为最低可能值
   */
  fee?: string | Asset | number
  /**
   * 可选的账户元数据
   */
  metadata?: { [key: string]: any }
}

export class BroadcastAPI {
  /**
   * 广播交易时将到期时间设置为未来多少毫秒
   * @default 60000
   */
  public expireTime = 60 * 1000

  constructor(readonly client: Client) { }

  /**
   * 广播转账操作
   * @param data 转账操作的内容
   * @param key 发送者的私有活动密钥
   */
  public async transfer(data: TransferOperation[1], key: PrivateKey) {
    const op: Operation = ['transfer', data]
    return this.sendOperations([op], key)
  }

  /**
   * 广播自定义JSON
   * @param data custom_json 操作的内容
   * @param key 私有发布密钥或活动密钥
   */
  public async json(data: CustomJsonOperation[1], key: PrivateKey) {
    const op: Operation = ['custom_json', data]
    return this.sendOperations([op], key)
  }

  /**
   * 在测试网络上创建新账户
   * @param options 新账户选项
   * @param key 账户创建者的私钥
   */
  public async createTestAccount(options: CreateAccountOptions, key: PrivateKey) {
    assert(Object.prototype.hasOwnProperty.call(globalThis, 'it'), 'helper to be used only for mocha tests')

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
      const chainProps = await this.client.baiyujing.getChainProperties()
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
   * 更新账户
   * @param data account_update的载荷
   * @param key 受影响账户的私钥，应该是相应的密钥级别或更高级别以更新账户权限
   */
  public async updateAccount(data: AccountUpdateOperation[1], key: PrivateKey) {
    const op: Operation = ['account_update', data]
    return this.sendOperations([op], key)
  }

  /**
   * 将气从一个账户委托给另一个账户。气仍由原始账户拥有，
   * 但司命信仰权和带宽分配将转移到接收账户。
   * 这将委托设置为`qi`，根据需要增加或减少它。
   * (即委托为0时会移除委托)
   *
   * 当委托被移除时，气会被置于一周的清算期，以防止同一个司命被重复投票。
   *
   * @param options 委托选项
   * @param key 委托人的私有活动密钥
   */
  public async delegateQi(options: DelegateQiOperation[1], key: PrivateKey) {
    const op: Operation = ['delegate_qi', options]
    return this.sendOperations([op], key)
  }

  /**
   * 补全交易中的必要字段
   * @param transaction 交易
   */
  public async prepareTransaction(transaction: Pick<Transaction, 'operations'> & Partial<Transaction>): Promise<Transaction> {
    const props = await this.client.baiyujing.getDynamicGlobalProperties()

    const ref_block_num = props.head_block_number & 0xFFFF
    const ref_block_prefix = new DataView(hexToBytes(props.head_block_id).buffer).getUint32(4, true)
    const expiration = new Date(new Date(`${props.time}Z`).getTime() + this.expireTime).toISOString().slice(0, -5)
    const extensions: unknown[] = []

    return Object.assign(
      {
        expiration,
        extensions,
        ref_block_num,
        ref_block_prefix,
      },
      transaction,
    )
  }

  /**
   * 签名并向网络广播带有操作的交易。如果交易过期则抛出异常。
   * @param operations 要发送的操作列表
   * @param key 用于签名交易的私钥
   */
  public async sendOperations(operations: Operation[], key: PrivateKey | PrivateKey[]): Promise<TransactionConfirmation> {
    const props = await this.client.baiyujing.getDynamicGlobalProperties()

    const ref_block_num = props.head_block_number & 0xFFFF
    const ref_block_prefix = new DataView(hexToBytes(props.head_block_id).buffer).getUint32(4, true)
    const expiration = new Date(new Date(`${props.time}Z`).getTime() + this.expireTime).toISOString().slice(0, -5)
    const extensions: unknown[] = []

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
   * 使用密钥签署交易
   */
  public sign(transaction: Transaction, key: PrivateKey | PrivateKey[]): SignedTransaction {
    return cryptoUtils.signTransaction(transaction, key, this.client.chainId)
  }

  /**
   * 向网络广播已签署的交易
   */
  public async send(transaction: SignedTransaction): Promise<TransactionConfirmation> {
    return this.call('broadcast_transaction_synchronous', [transaction])
  }

  /**
   * 调用`baiyujing_api`的便捷方法
   */
  public call(method: string, params?: any[]) {
    return this.client.call('baiyujing_api', method, params)
  }
}
