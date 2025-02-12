/* eslint-disable ts/no-unsafe-declaration-merging */
import type { Client } from '../client'

import type { AuthorityType } from '../taiyi/account'
import type * as operations from '../taiyi/operation'
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

const allOperations: (operations.Operation[0] | [name: operations.Operation[0], alias: string])[] = [
  // 'account_create',
  ['account_update', 'updateAccount'],

  'transfer',
  'transfer_to_qi',
  'withdraw_qi',
  'set_withdraw_qi_route',
  'delegate_qi',

  'siming_update',
  'siming_set_properties',
  'account_siming_adore',
  'account_siming_proxy',
  'decline_adoring_rights',

  'custom',
  'custom_json',

  'request_account_recovery',
  'recover_account',
  'change_recovery_account',

  'claim_reward_balance',

  'create_contract',
  'revise_contract',
  'call_contract_function',

  'create_nfa_symbol',
  'create_nfa',
  'transfer_nfa',
  'approve_nfa_active',
  'action_nfa',

  'create_zone',

  'create_actor_talent_rule',
  'create_actor',

  'hardfork',
  'fill_qi_withdraw',
  'return_qi_delegation',
  'producer_reward',

  'nfa_convert_resources',
  'nfa_transfer',
  'nfa_deposit_withdraw',
  'reward_feigang',
  'reward_cultivation',

  'tiandao_year_change',
  'tiandao_month_change',
  'tiandao_time_change',

  'actor_born',
  'actor_talent_trigger',
  'actor_movement',
  'actor_grown',

  'narrate_log',
]

function methodToOperationName(methodName: string): string {
  return methodName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

export interface BroadcastAPI {
  // createAccount: (options: CreateAccountOptions, key: PrivateKey) => Promise<TransactionConfirmation>
  /** 更新账户 */
  updateAccount: (data: operations.AccountUpdateOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>

  /** 广播转账操作 */
  transfer: (data: operations.TransferOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  /** 广播以QI发送交易 */
  transferToQi: (data: operations.TransferToQiOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  /** 广播提现QI操作 */
  withdrawQi: (data: operations.WithdrawQiOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  /** 广播设置提现QI路由 */
  setWithdrawQiRoute: (data: operations.SetWithdrawQiRouteOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  /**
   * 将气从一个账户委托给另一个账户。气仍由原始账户拥有，
   * 但司命崇拜权和带宽分配将转移到接收账户。
   * 这将委托设置为`qi`，根据需要增加或减少它。
   * (即委托为0时会移除委托)
   *
   * 当委托被移除时，气会被置于一周的清算期，以防止同一个司命被重复投票。
   */
  delegateQi: (data: operations.DelegateQiOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>

  simingUpdate: (data: operations.SimingUpdateOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  simingSetProperties: (data: operations.SimingSetPropertiesOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  accountSimingAdore: (data: operations.AccountSimingAdoreOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  accountSimingProxy: (data: operations.AccountSimingProxyOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  declineAdoringRights: (data: operations.DeclineAdoringRightsOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>

  /** 广播自定义数据 */
  custom: (data: operations.CustomOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  /** 广播自定义JSON */
  customJson: (data: operations.CustomJsonOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>

  requestAccountRecovery: (data: operations.RequestAccountRecoveryOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  recoverAccount: (data: operations.RecoverAccountOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  changeRecoveryAccount: (data: operations.ChangeRecoveryAccountOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>

  claimRewardBalance: (data: operations.ClaimRewardBalanceOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>

  createContract: (data: operations.CreateContractOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  reviseContract: (data: operations.ReviseContractOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  callContractFunction: (data: operations.CallContractFunctionOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>

  createNfaSymbol: (data: operations.CreateNfaSymbolOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  createNfa: (data: operations.CreateNfaOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  transferNfa: (data: operations.TransferNfaOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  approveNfaActive: (data: operations.ApproveNfaActiveOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  actionNfa: (data: operations.ActionNfaOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>

  /** 创建区域 */
  createZone: (data: operations.CreateZoneOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>

  /** 创建角色天赋规则 */
  createActorTalentRule: (data: operations.CreateActorTalentRuleOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  /** 创建角色 */
  createActor: (data: operations.CreateActorOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>

  hardfork: (data: operations.HardforkOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  fillQiWithdraw: (data: operations.FillQiWithdrawOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  returnQiDelegation: (data: operations.ReturnQiDelegationOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  producerReward: (data: operations.ProducerRewardOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>

  nfaConvertResources: (data: operations.NfaConvertResourcesOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  nfaTransfer: (data: operations.NfaTransferOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  nfaDepositWithdraw: (data: operations.NfaDepositWithdrawOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  rewardFeigang: (data: operations.RewardFeigangOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  rewardCultivation: (data: operations.RewardCultivationOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>

  tiandaoYearChange: (data: operations.TiandaoYearChangeOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  tiandaoMonthChange: (data: operations.TiandaoMonthChangeOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  tiandaoTimeChange: (data: operations.TiandaoTimeChangeOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>

  actorBorn: (data: operations.ActorBornOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  actorTalentTrigger: (data: operations.ActorTalentTriggerOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  actorMovement: (data: operations.ActorMovementOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
  actorGrown: (data: operations.ActorGrownOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>

  narrateLog: (data: operations.NarrateLogOperation[1], key: PrivateKey) => Promise<TransactionConfirmation>
}

export class BroadcastAPI {
  /**
   * 广播交易时将到期时间设置为未来多少毫秒
   * @default 60000
   */
  public expireTime = 60 * 1000

  constructor(readonly client: Client) {
    return new Proxy(this, {
      get(target, prop) {
        if (typeof prop === 'string') {
          const opName = methodToOperationName(prop)
          const operation = allOperations.find(op => Array.isArray(op) ? op[1] === prop : op === opName)
          if (operation) {
            return (data: operations.Operation[1], key: PrivateKey) => {
              const operationName = Array.isArray(operation) ? operation[0] : operation
              const op: operations.Operation = [operationName, data]
              return target.sendOperations([op], key)
            }
          }
        }

        return Reflect.get(target, prop)
      },
    })
  }

  /**
   * 创建新账户
   * @param options 新账户选项
   * @param key 账户创建者的私钥
   */
  public async createAccount(options: CreateAccountOptions, key: PrivateKey) {
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

    const create_op: operations.AccountCreateOperation = [
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
  public async sendOperations(operations: operations.Operation[], key: PrivateKey | PrivateKey[]): Promise<TransactionConfirmation> {
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
