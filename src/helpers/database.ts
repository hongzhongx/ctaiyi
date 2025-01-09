import {Client} from './../client'
import {ExtendedAccount} from './../taiyi/account'
import {Asset, Price} from './../taiyi/asset'
import {BlockHeader, SignedBlock} from './../taiyi/block'
import {DynamicGlobalProperties} from './../taiyi/misc'
import {ChainProperties, QiDelegation} from './../taiyi/misc'
import {AppliedOperation} from './../taiyi/operation'
import {SignedTransaction, Transaction, TransactionConfirmation} from './../taiyi/transaction'

export class DatabaseAPI {

    constructor(readonly client: Client) {}

    /**
     * Convenience for calling `database_api`.
     */
    public call(method: string, params?: any[]) {
        return this.client.call('baiyujing_api', method, params)
    }

    /**
     * Return state of server.
     */
    public getDynamicGlobalProperties(): Promise<DynamicGlobalProperties> {
        return this.call('get_dynamic_global_properties')
    }

    /**
     * Return median chain properties decided by siming.
     */
    public async getChainProperties(): Promise<ChainProperties> {
        return this.call('get_chain_properties')
    }

    /**
     * Return all of the state required for a particular url path.
     * @param path Path component of url conforming to condenser's scheme
     *             e.g. `@almost-digital` or `trending/travel`
     */
    public async getState(path: string): Promise<any> {
        return this.call('get_state', [path])
    }

    /**
     * Get list of delegations made by account.
     * @param account Account delegating
     * @param from Delegatee start offset, used for paging.
     * @param limit Number of results, max 1000.
     */
    public async getQiDelegations(account: string, from: string = '', limit: number = 1000): Promise<QiDelegation[]> {
        return this.call('get_qi_delegations', [account, from, limit])
    }

    /**
     * Return server config. See:
     * https://github.com/hongzhongx/taiyi/blob/main/libraries/protocol/config.hpp
     */
    public getConfig(): Promise<{[name: string]: string|number|boolean}> {
        return this.call('get_config')
    }

    /**
     * Return header for *blockNum*.
     */
    public getBlockHeader(blockNum: number): Promise<BlockHeader> {
        return this.call('get_block_header', [blockNum])
    }

    /**
     * Return block *blockNum*.
     */
    public getBlock(blockNum: number): Promise<SignedBlock> {
        return this.call('get_block', [blockNum])
    }

    /**
     * Return all applied operations in *blockNum*.
     */
    public getOperations(blockNum: number, onlyVirtual: boolean = false): Promise<AppliedOperation[]> {
        return this.call('get_ops_in_block', [blockNum, onlyVirtual])
    }

    /**
     * Return array of account info objects for the usernames passed.
     * @param usernames The accounts to fetch.
     */
    public getAccounts(usernames: string[]): Promise<ExtendedAccount[]> {
        return this.call('get_accounts', [usernames])
    }

    /**
     * Convenience to fetch a block and return a specific transaction.
     */
    public async getTransaction(txc: TransactionConfirmation | {block_num: number, id: string}) {
        const block = await this.client.database.getBlock(txc.block_num)
        const idx = block.transaction_ids.indexOf(txc.id)
        if (idx === -1) {
            throw new Error(`Unable to find transaction ${ txc.id } in block ${ txc.block_num }`)
        }
        return block.transactions[idx] as SignedTransaction
    }

    /**
     * Verify signed transaction.
     */
    public async verifyAuthority(stx: SignedTransaction): Promise<boolean> {
        return this.call('verify_authority', [stx])
    }

}
