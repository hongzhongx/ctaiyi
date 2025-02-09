import type { Client } from '../client'
import type { Account, AuthorityType, ExtendedAccount } from '../taiyi/account'
import type { Actor, ActorTalentRule } from '../taiyi/actor'
import type { MaterialAssets } from '../taiyi/asset'
import type { BlockHeader, SignedBlock } from '../taiyi/block'
import type { ChainProperties, DynamicGlobalProperties, QiDelegation } from '../taiyi/misc'
import type { LuaValue, Nfa } from '../taiyi/nfa'
import type { AppliedOperation } from '../taiyi/operation'
import type { RewardFund } from '../taiyi/rewards'
import type { ScheduleSiming, Siming } from '../taiyi/siming'
import type { TianDaoProperties, Zone, ZoneType } from '../taiyi/tiandao'
import type { SignedTransaction, Transaction } from '../taiyi/transaction'

export class BaiYuJingAPI {
  constructor(private readonly client: Client) { }

  /**
   * 用于调用 `baiyujing_api` 的便捷方法。
   */
  public call<T>(method: string, params?: any[]) {
    return this.client.call<T>('baiyujing_api', method, params)
  }

  public async getState(withRoute?: string) {
    return this.call<{ current_route: string, simings: Record<string, Siming>, accounts: Record<string, ExtendedAccount>, props: DynamicGlobalProperties, siming_schedule: ScheduleSiming }>('get_state', [withRoute])
  }

  /** 当前司命 */
  public async getActiveSimings() {
    return this.call<string[]>('get_active_simings')
  }

  public async getBlockHeader(blockNum: number) {
    return this.call<BlockHeader>('get_block_header', [blockNum])
  }

  public async getBlock(blockNum: number) {
    return this.call<SignedBlock>('get_block', [blockNum])
  }

  public async getOperations(blockNum: number, onlyVirtual: boolean = false) {
    return this.call<AppliedOperation[]>('get_ops_in_block', [blockNum, onlyVirtual])
  }

  public getConfig() {
    return this.call<Record<string, string | number | boolean>>('get_config')
  }

  public async getDynamicGlobalProperties() {
    return this.call<DynamicGlobalProperties>('get_dynamic_global_properties')
  }

  public async getChainProperties() {
    return this.call<ChainProperties>('get_chain_properties')
  }

  public async getSimingSchedule() {
    return this.call<ScheduleSiming>('get_siming_schedule')
  }

  public async getHardforkVersion() {
    return this.call<string>('get_hardfork_version')
  }

  public async getNextScheduledHardFork() {
    return this.call<number>('get_next_scheduled_hardfork')
  }

  public async getRewardFund(name: string) {
    return this.call<RewardFund>('get_reward_fund', [name])
  }

  public async getKeyReferences(keys: string[]) {
    return this.call<string[]>('get_key_references', [keys])
  }

  // #region Account

  async getAccounts(names: string[]) {
    return this.call<ExtendedAccount[]>('get_accounts', [names])
  }

  async lookupAccountNames(names: string[]) {
    return this.call<Account[]>('lookup_account_names', [names])
  }

  /** 模糊查找用户名 */
  async lookupAccounts(lowerBoundName: string, limit: number) {
    return this.call<string[]>('lookup_accounts', [lowerBoundName, limit])
  }

  async getAccountsCount() {
    return this.call<number>('get_account_count')
  }

  /**
   * 从 `start` 开始反向查询指定账户的操作历史
   *
   * @param accountName 账户名
   * @param start `-1` 或者任意正整数
   * @param limit 最大 1000，如果 start 为正，需要小于 start
   */
  async getAccountHistory(accountName: string, start: number, limit: number) {
    return this.call<[nonce: number, operation: AppliedOperation][]>('get_account_history', [accountName, start, limit])
  }

  async getAccountResources(accountName: string[]) {
    return this.call<MaterialAssets[]>('get_account_resources', [accountName])
  }

  /**
   *  获取指定账户的 owner key 历史
   */
  async getOwnerHistory(account: string) {
    return this.call<{ id: number, account: string, previous_owner_authority: AuthorityType, last_valid_time: number }[]>('get_owner_history', [account])
  }

  /**
   * 获取指定账户的恢复请求
   */
  async getRecoveryRequest(accountName: string) {
    return this.call<{ id: number, account_to_recover: string, new_owner_authority: AuthorityType, expires: number } | null>('get_recovery_request', [accountName])
  }

  async getWithdrawRoutes(accountName: string, routeType?: 'incoming' | 'outgoing' | 'all') {
    return this.call<{ from_account: string, to_account: string, percent: number, auto_vest: boolean }[]>('get_withdraw_routes', [accountName, routeType])
  }

  async getQiDelegations(delegator: string, start: number, limit?: number) {
    return this.call<QiDelegation[]>('get_qi_delegations', [delegator, start, limit])
  }

  async getExpiringQiDelegations(delegator: string, start: number, limit?: number) {
    return this.call<{ id: string, delegator: string, qi: string, expiration: number }[]>('get_expiring_qi_delegations', [delegator, start, limit])
  }

  // #region Siming
  async getSimings(simingIds: number[]) {
    return this.call<Siming[]>('get_simings', [simingIds])
  }

  async getSimingByAccount(accountName: string) {
    return this.call<Siming>('get_siming_by_account', [accountName])
  }

  async getSimingsByAdore(startName: string, limit: number) {
    return this.call<Siming[]>('get_simings_by_adore', [startName, limit])
  }

  async lookupSimingAccounts(lowerBoundName: string, limit: number) {
    return this.call<string[]>('lookup_siming_accounts', [lowerBoundName, limit])
  }

  async getSimingCount() {
    return this.call<number>('get_siming_count')
  }
  // #endregion

  // #region Transaction

  async getTransactionHex(tx: SignedTransaction | Transaction) {
    return this.call<string>('get_transaction_hex', [tx])
  }

  async getTransaction(trxId: string) {
    return this.call<Transaction>('get_transaction', [trxId])
  }

  async getTransactionResults(trxId: string) {
    return this.call<AppliedOperation[]>('get_transaction_results', [trxId])
  }

  async getRequiredSignatures(trx: SignedTransaction, availableKeys: string[]) {
    return this.call<string[]>('get_required_signatures', [trx, availableKeys])
  }

  async getPotentialSignatures(trx: SignedTransaction) {
    return this.call<string[]>('get_potential_signatures', [trx])
  }

  async verifyAuthority(trx: SignedTransaction) {
    return this.call<boolean>('verify_authority', [trx])
  }

  async verifyAccountAuthority(accountName: string, keys: string[]) {
    return this.call<boolean>('verify_account_authority', [accountName, keys])
  }

  // #endregion

  // #region NFA
  async findNfa(nfaId: number) {
    return this.call<Nfa>('find_nfa', [nfaId])
  }

  async findNfas(nfaIds: number[]) {
    return this.call<Nfa[]>('find_nfas', [nfaIds])
  }

  async listNfas(owner: string, limit: number) {
    return this.call<Nfa[]>('list_nfas', [owner, limit])
  }

  async getNfaHistory(nfaId: number, limit: number, start: number) {
    return this.call<[number, AppliedOperation][]>('get_nfa_history', [nfaId, limit, start])
  }

  async getNfaActionInfo(nfaId: number, action: string) {
    return this.call<{ exist: boolean, consequence: boolean }>('get_nfa_action_info', [nfaId, action])
  }

  async evalNfaAction(nfaId: number, action: string, args: any[]) {
    return this.call<{ eval_result: LuaValue[], narrate_logs: string[], err: string }>('eval_nfa_action', [nfaId, action, args])
  }

  async evalNfaActionWithStringArgs(nfaId: number, action: string, json: string) {
    return this.call<{ eval_result: LuaValue[], narrate_logs: string[], err: string }>('eval_nfa_action_with_string_args', [nfaId, action, json])
  }

  // #endregion

  // #region Actor
  async findActor(actorName: string) {
    return this.call<Actor>('find_actor', [actorName])
  }

  async findActors(actorIds: number[]) {
    return this.call<Actor[]>('find_actors', [actorIds])
  }

  async listActors(owner: string, limit: number) {
    return this.call<Actor[]>('list_actors', [owner, limit])
  }

  async getActorHistory(actorName: string, start: number, limit: number) {
    return this.call<[number, AppliedOperation][]>('get_actor_history', [actorName, start, limit])
  }

  async listActorsBelowHealth(start: number, limit: number) {
    return this.call<Actor[]>('list_actors_below_health', [start, limit])
  }

  async findActorTalentRules(rulesIds: number[]) {
    return this.call<ActorTalentRule[]>('find_actor_talent_rules', [rulesIds])
  }

  async listActorsOnZone(zoneId: number, limit: number) {
    return this.call<Actor[]>('list_actors_on_zone', [zoneId, limit])
  }
  // #endregion

  // #region Tiandao

  async getTiandaoProperties() {
    return this.call<TianDaoProperties>('get_tiandao_properties')
  }

  async findZones(zoneIds: number[]) {
    return this.call<Zone[]>('find_zones', [zoneIds])
  }

  async findZonesByName(zoneNames: string[]) {
    return this.call<Zone[]>('find_zones_by_name', [zoneNames])
  }

  async listZones(owner: string, limit: number) {
    return this.call<Zone[]>('list_zones', [owner, limit])
  }

  async listZonesByType(zoneType: ZoneType, limit: number) {
    return this.call<Zone[]>('list_zones_by_type', [zoneType, limit])
  }

  async listToZonesByFrom(fromZoneName: string, limit: number) {
    return this.call<Zone[]>('list_to_zones_by_from', [fromZoneName, limit])
  }

  async listFromZonesByTo(toZoneName: string, limit: number) {
    return this.call<Zone[]>('list_from_zones_by_to', [toZoneName, limit])
  }

  async findWayToZone(fromZoneName: string, toZoneName: string) {
    return this.call<{ way_points: string[] }>('find_way_to_zone', [fromZoneName, toZoneName])
  }

  async getContractSourceCode(contractName: string) {
    return this.call<string>('get_contract_source_code', [contractName])
  }

  // #endregion
}
