declare module 'ctaiyi/version' {
	 const _default: string;
	export default _default;

}
declare module 'ctaiyi/taiyi/asset' {
	export interface SMTAsset {
	    amount: string | number;
	    precision: number;
	    nai: string;
	}
	/**
	 * Asset symbol string.
	 */
	export type AssetSymbol = 'YANG' | 'QI' | 'YIN' | 'GOLD' | 'FOOD' | 'WOOD' | 'FABR' | 'HERB';
	/**
	 * Class representing a taiyi asset, e.g. `1.000 YANG` or `12.112233 QI`.
	 */
	export class Asset {
	    readonly amount: number;
	    readonly symbol: AssetSymbol;
	    /**
	     * Create a new Asset instance from a string, e.g. `42.000 YANG`.
	     */
	    static fromString(string: string, expectedSymbol?: AssetSymbol): Asset;
	    /**
	     * Convenience to create new Asset.
	     * @param symbol Symbol to use when created from number. Will also be used to validate
	     *               the asset, throws if the passed value has a different symbol than this.
	     */
	    static from(value: string | Asset | number, symbol?: AssetSymbol): Asset;
	    /**
	     * Return the smaller of the two assets.
	     */
	    static min(a: Asset, b: Asset): Asset;
	    /**
	     * Return the larger of the two assets.
	     */
	    static max(a: Asset, b: Asset): Asset;
	    constructor(amount: number, symbol: AssetSymbol);
	    /**
	     * Return asset precision.
	     */
	    getPrecision(): number;
	    /**
	     * Return a string representation of this asset, e.g. `42.000 YANG`.
	     */
	    toString(): string;
	    /**
	     * Return a new Asset instance with amount added.
	     */
	    add(amount: Asset | string | number): Asset;
	    /**
	     * Return a new Asset instance with amount subtracted.
	     */
	    subtract(amount: Asset | string | number): Asset;
	    /**
	     * Return a new Asset with the amount multiplied by factor.
	     */
	    multiply(factor: Asset | string | number): Asset;
	    /**
	     * Return a new Asset with the amount divided.
	     */
	    divide(divisor: Asset | string | number): Asset;
	    /**
	     * For JSON serialization, same as toString().
	     */
	    toJSON(): string;
	}
	export type PriceType = Price | {
	    base: Asset | string;
	    quote: Asset | string;
	};
	/**
	 * Represents quotation of the relative value of asset against another asset.
	 * Similar to 'currency pair' used to determine value of currencies.
	 *
	 *  For example:
	 *  1 EUR / 1.25 USD where:
	 *  1 EUR is an asset specified as a base
	 *  1.25 USD us an asset specified as a qute
	 *
	 *  can determine value of EUR against USD.
	 */
	export class Price {
	    readonly base: Asset;
	    readonly quote: Asset;
	    /**
	     * Convenience to create new Price.
	     */
	    static from(value: PriceType): Price;
	    /**
	     * @param base  - represents a value of the price object to be expressed relatively to quote
	     *                asset. Cannot have amount == 0 if you want to build valid price.
	     * @param quote - represents an relative asset. Cannot have amount == 0, otherwise
	     *                asertion fail.
	     *
	     * Both base and quote shall have different symbol defined.
	     */
	    constructor(base: Asset, quote: Asset);
	    /**
	     * Return a string representation of this price pair.
	     */
	    toString(): string;
	    /**
	     * Return a new Asset with the price converted between the symbols in the pair.
	     * Throws if passed asset symbol is not base or quote.
	     */
	    convert(asset: Asset): Asset;
	}

}
declare module 'ctaiyi/taiyi/account' {
	import { PublicKey } from 'ctaiyi/crypto';
	import { Asset } from 'ctaiyi/taiyi/asset';
	export interface AuthorityType {
	    weight_threshold: number;
	    account_auths: Array<[string, number]>;
	    key_auths: Array<[string | PublicKey, number]>;
	}
	export class Authority implements AuthorityType {
	    /**
	     * Convenience to create a new instance from PublicKey or authority object.
	     */
	    static from(value: string | PublicKey | AuthorityType): Authority;
	    weight_threshold: number;
	    account_auths: Array<[string, number]>;
	    key_auths: Array<[string | PublicKey, number]>;
	    constructor({ weight_threshold, account_auths, key_auths }: AuthorityType);
	}
	export interface Account {
	    id: number;
	    name: string;
	    owner: Authority;
	    active: Authority;
	    posting: Authority;
	    memo_key: string;
	    json_metadata: string;
	    proxy: string;
	    last_owner_update: string;
	    last_account_update: string;
	    created: string;
	    recovery_account: string;
	    last_account_recovery: string;
	    balance: string | Asset;
	    reward_yang_balance: string | Asset;
	    reward_qi_balance: string | Asset;
	    qi: string | Asset;
	    delegated_qi: string | Asset;
	    received_qi: string | Asset;
	    qi_withdraw_rate: string | Asset;
	    next_qi_withdrawal_time: string;
	    withdrawn: number | string;
	    to_withdraw: number | string;
	    withdraw_routes: number;
	    proxied_vsf_adores: number[];
	    simings_voted_for: number;
	}
	export interface ExtendedAccount extends Account {
	    /**
	     * Transfer to/from vesting.
	     */
	    transfer_history: any[];
	}

}
declare module 'ctaiyi/taiyi/misc' {
	/// <reference types="node" />
	import { Account } from 'ctaiyi/taiyi/account';
	import { Asset, Price } from 'ctaiyi/taiyi/asset';
	/**
	 * Large number that may be unsafe to represent natively in JavaScript.
	 */
	export type Bignum = string;
	/**
	 * Buffer wrapper that serializes to a hex-encoded string.
	 */
	export class HexBuffer {
	    buffer: Buffer;
	    /**
	     * Convenience to create a new HexBuffer, does not copy data if value passed is already a buffer.
	     */
	    static from(value: Buffer | HexBuffer | number[] | string): HexBuffer;
	    constructor(buffer: Buffer);
	    toString(encoding?: string): string;
	    toJSON(): string;
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
	    account_creation_fee: string | Asset;
	    /**
	     * This simings vote for the maximum_block_size which is used by the network
	     * to tune rate limiting and capacity.
	     */
	    maximum_block_size: number;
	}
	export interface QiDelegation {
	    /**
	     * Delegation id.
	     */
	    id: number;
	    /**
	     * Account that is delegating qi to delegatee.
	     */
	    delegator: string;
	    /**
	     * Account that is receiving qi from delegator.
	     */
	    delegatee: string;
	    /**
	     * Amount of QI delegated.
	     */
	    qi: Asset | string;
	    /**
	     * Earliest date delegation can be removed.
	     */
	    min_delegation_time: string;
	}
	/**
	 * Node state.
	 */
	export interface DynamicGlobalProperties {
	    id: number;
	    /**
	     * Current block height.
	     */
	    head_block_number: number;
	    head_block_id: string;
	    /**
	     * UTC Server time, e.g. 2020-01-15T00:42:00
	     */
	    time: string;
	    /**
	     * Currently elected siming.
	     */
	    current_siming: string;
	    current_supply: Asset | string;
	    /**
	     * Total asset held in confidential balances.
	     */
	    total_qi: Asset | string;
	    pending_rewarded_qi: Asset | string;
	    pending_rewarded_feigang: Asset | string;
	    pending_cultivation_qi: Asset | string;
	    total_gold: Asset | string;
	    total_food: Asset | string;
	    total_wood: Asset | string;
	    total_fabric: Asset | string;
	    total_herb: Asset | string;
	    /**
	     * Maximum block size is decided by the set of active simings which change every round.
	     * Each siming posts what they think the maximum size should be as part of their siming
	     * properties, the median size is chosen to be the maximum block size for the round.
	     *
	     * @note the minimum value for maximum_block_size is defined by the protocol to prevent the
	     * network from getting stuck by simings attempting to set this too low.
	     */
	    maximum_block_size: number;
	    /**
	     * The current absolute slot number. Equal to the total
	     * number of slots since genesis. Also equal to the total
	     * number of missed slots plus head_block_number.
	     */
	    current_aslot: number;
	    /**
	     * Used to compute siming participation.
	     */
	    recent_slots_filled: Bignum;
	    participation_count: number;
	    last_irreversible_block_num: number;
	}
	/**
	 * Return the qi price.
	 */
	export function getQiPrice(): Price;
	/**
	 * Returns the qi of specified account. Default: Subtract delegated & add received
	 */
	export function getQi(account: Account, subtract_delegated?: boolean, add_received?: boolean): number;

}
declare module 'ctaiyi/taiyi/serializer' {
	/// <reference types="node" />
	import * as ByteBuffer from 'bytebuffer';
	import { PublicKey } from 'ctaiyi/crypto';
	import { Asset } from 'ctaiyi/taiyi/asset';
	import { HexBuffer } from 'ctaiyi/taiyi/misc';
	import { Operation } from 'ctaiyi/taiyi/operation';
	export type Serializer = (buffer: ByteBuffer, data: any) => void;
	export const Types: {
	    Array: (itemSerializer: Serializer) => (buffer: ByteBuffer, data: any[]) => void;
	    Asset: (buffer: ByteBuffer, data: Asset | string | number) => void;
	    Authority: (buffer: ByteBuffer, data: {
	        [key: string]: any;
	    }) => void;
	    Binary: (size?: number | undefined) => (buffer: ByteBuffer, data: Buffer | HexBuffer) => void;
	    Boolean: (buffer: ByteBuffer, data: boolean) => void;
	    Date: (buffer: ByteBuffer, data: string) => void;
	    FlatMap: (keySerializer: Serializer, valueSerializer: Serializer) => (buffer: ByteBuffer, data: Array<[any, any]>) => void;
	    Int16: (buffer: ByteBuffer, data: number) => void;
	    Int32: (buffer: ByteBuffer, data: number) => void;
	    Int64: (buffer: ByteBuffer, data: number) => void;
	    Int8: (buffer: ByteBuffer, data: number) => void;
	    Object: (keySerializers: Array<[string, Serializer]>) => (buffer: ByteBuffer, data: {
	        [key: string]: any;
	    }) => void;
	    Operation: (buffer: ByteBuffer, operation: Operation) => void;
	    Optional: (valueSerializer: Serializer) => (buffer: ByteBuffer, data: any) => void;
	    Price: (buffer: ByteBuffer, data: {
	        [key: string]: any;
	    }) => void;
	    PublicKey: (buffer: ByteBuffer, data: PublicKey | string | null) => void;
	    StaticVariant: (itemSerializers: Serializer[]) => (buffer: ByteBuffer, data: [number, any]) => void;
	    String: (buffer: ByteBuffer, data: string) => void;
	    Transaction: (buffer: ByteBuffer, data: {
	        [key: string]: any;
	    }) => void;
	    UInt16: (buffer: ByteBuffer, data: number) => void;
	    UInt32: (buffer: ByteBuffer, data: number) => void;
	    UInt64: (buffer: ByteBuffer, data: number) => void;
	    UInt8: (buffer: ByteBuffer, data: number) => void;
	    Void: (buffer: ByteBuffer) => never;
	};

}
declare module 'ctaiyi/utils' {
	/**
	 * @file Misc utility functions.
	 */
	/// <reference types="node" />
	import { EventEmitter } from 'events';
	/**
	 * Return a promise that will resove when a specific event is emitted.
	 */
	export function waitForEvent<T>(emitter: EventEmitter, eventName: string | symbol): Promise<T>;
	/**
	 * Sleep for N milliseconds.
	 */
	export function sleep(ms: number): Promise<void>;
	/**
	 * Return a stream that emits iterator values.
	 */
	export function iteratorStream<T>(iterator: AsyncIterableIterator<T>): NodeJS.ReadableStream;
	/**
	 * Return a deep copy of a JSON-serializable object.
	 */
	export function copy<T>(object: T): T;
	/**
	 * Fetch API wrapper that retries until timeout is reached.
	 */
	export function retryingFetch(url: string, opts: any, timeout: number, backoff: (tries: number) => number, fetchTimeout?: (tries: number) => number): Promise<any>;
	import { PublicKey } from 'ctaiyi/crypto';
	import { Asset } from 'ctaiyi/taiyi/asset';
	import { SimingSetPropertiesOperation } from 'ctaiyi/taiyi/operation';
	export interface SimingProps {
	    account_creation_fee?: string | Asset;
	    key: PublicKey | string;
	    maximum_block_size?: number;
	    new_signing_key?: PublicKey | string | null;
	    url?: string;
	}
	export function buildSimingUpdateOp(owner: string, props: SimingProps): SimingSetPropertiesOperation;

}
declare module 'ctaiyi/crypto' {
	/// <reference types="node" />
	import { SignedTransaction, Transaction } from 'ctaiyi/taiyi/transaction';
	/**
	 * Network id used in WIF-encoding.
	 */
	export const NETWORK_ID: Buffer; function ripemd160(input: Buffer | string): Buffer; function sha256(input: Buffer | string): Buffer; function doubleSha256(input: Buffer | string): Buffer; function encodePublic(key: Buffer, prefix: string): string; function encodePrivate(key: Buffer): string; function decodePrivate(encodedKey: string): Buffer; function isCanonicalSignature(signature: Buffer): boolean;
	/**
	 * ECDSA (secp256k1) public key.
	 */
	export class PublicKey {
	    readonly key: Buffer;
	    readonly prefix: string;
	    /**
	     * Create a new instance from a WIF-encoded key.
	     */
	    static fromString(wif: string): PublicKey;
	    /**
	     * Create a new instance.
	     */
	    static from(value: string | PublicKey): PublicKey;
	    constructor(key: Buffer, prefix?: string);
	    /**
	     * Verify a 32-byte signature.
	     * @param message 32-byte message to verify.
	     * @param signature Signature to verify.
	     */
	    verify(message: Buffer, signature: Signature): boolean;
	    /**
	     * Return a WIF-encoded representation of the key.
	     */
	    toString(): string;
	    /**
	     * Return JSON representation of this key, same as toString().
	     */
	    toJSON(): string;
	    /**
	     * Used by `utils.inspect` and `console.log` in node.js.
	     */
	    inspect(): string;
	}
	export type KeyRole = 'owner' | 'active' | 'posting' | 'memo';
	/**
	 * ECDSA (secp256k1) private key.
	 */
	export class PrivateKey {
	    private key;
	    /**
	     * Convenience to create a new instance from WIF string or buffer.
	     */
	    static from(value: string | Buffer): PrivateKey;
	    /**
	     * Create a new instance from a WIF-encoded key.
	     */
	    static fromString(wif: string): PrivateKey;
	    /**
	     * Create a new instance from a seed.
	     */
	    static fromSeed(seed: string): PrivateKey;
	    /**
	     * Create key from username and password.
	     */
	    static fromLogin(username: string, password: string, role?: KeyRole): PrivateKey;
	    constructor(key: Buffer);
	    /**
	     * Sign message.
	     * @param message 32-byte message.
	     */
	    sign(message: Buffer): Signature;
	    /**
	     * Derive the public key for this private key.
	     */
	    createPublic(prefix?: string): PublicKey;
	    /**
	     * Return a WIF-encoded representation of the key.
	     */
	    toString(): string;
	    /**
	     * Used by `utils.inspect` and `console.log` in node.js. Does not show the full key
	     * to get the full encoded key you need to explicitly call {@link toString}.
	     */
	    inspect(): string;
	}
	/**
	 * ECDSA (secp256k1) signature.
	 */
	export class Signature {
	    data: Buffer;
	    recovery: number;
	    static fromBuffer(buffer: Buffer): Signature;
	    static fromString(string: string): Signature;
	    constructor(data: Buffer, recovery: number);
	    /**
	     * Recover public key from signature by providing original signed message.
	     * @param message 32-byte message that was used to create the signature.
	     */
	    recover(message: Buffer, prefix?: string): PublicKey;
	    toBuffer(): Buffer;
	    toString(): string;
	} function transactionDigest(transaction: Transaction | SignedTransaction, chainId?: Buffer): Buffer; function signTransaction(transaction: Transaction, keys: PrivateKey | PrivateKey[], chainId?: Buffer): SignedTransaction;
	/** Misc crypto utility functions. */
	export const cryptoUtils: {
	    decodePrivate: typeof decodePrivate;
	    doubleSha256: typeof doubleSha256;
	    encodePrivate: typeof encodePrivate;
	    encodePublic: typeof encodePublic;
	    isCanonicalSignature: typeof isCanonicalSignature;
	    ripemd160: typeof ripemd160;
	    sha256: typeof sha256;
	    signTransaction: typeof signTransaction;
	    transactionDigest: typeof transactionDigest;
	};
	export {};

}
declare module 'ctaiyi/taiyi/operation' {
	/// <reference types="node" />
	import { PublicKey } from 'ctaiyi/crypto';
	import { AuthorityType } from 'ctaiyi/taiyi/account';
	import { Asset } from 'ctaiyi/taiyi/asset';
	import { ChainProperties, HexBuffer } from 'ctaiyi/taiyi/misc';
	/**
	 * Operation name.
	 */
	export type OperationName = 'account_create' | 'account_update' | 'account_siming_proxy' | 'account_siming_adore' | 'change_recovery_account' | 'claim_reward_balance' | 'custom' | 'custom_json' | 'decline_adoring_rights' | 'delegate_qi' | 'recover_account' | 'request_account_recovery' | 'set_withdraw_qi_route' | 'transfer' | 'transfer_to_qi' | 'withdraw_qi' | 'siming_set_properties' | 'siming_update';
	/**
	 * Virtual operation name.
	 */
	export type VirtualOperationName = 'fill_qi_withdraw' | 'hardfork' | 'return_qi_delegation';
	/**
	 * Generic operation.
	 */
	export interface Operation {
	    0: OperationName | VirtualOperationName;
	    1: {
	        [key: string]: any;
	    };
	}
	export interface AppliedOperation {
	    trx_id: string;
	    block: number;
	    trx_in_block: number;
	    op_in_trx: number;
	    virtual_op: number;
	    timestamp: string;
	    op: Operation;
	}
	export interface AccountCreateOperation extends Operation {
	    0: 'account_create';
	    1: {
	        fee: string | Asset;
	        creator: string;
	        new_account_name: string;
	        owner: AuthorityType;
	        active: AuthorityType;
	        posting: AuthorityType;
	        memo_key: string | PublicKey;
	        json_metadata: string;
	    };
	}
	export interface AccountUpdateOperation extends Operation {
	    0: 'account_update';
	    1: {
	        account: string;
	        owner?: AuthorityType;
	        active?: AuthorityType;
	        posting?: AuthorityType;
	        memo_key: string | PublicKey;
	        json_metadata: string;
	    };
	}
	export interface AccountSimingProxyOperation extends Operation {
	    0: 'account_siming_proxy';
	    1: {
	        account: string;
	        proxy: string;
	    };
	}
	export interface AccountSimingAdoreOperation extends Operation {
	    0: 'account_siming_adore';
	    1: {
	        account: string;
	        siming: string;
	        approve: boolean;
	    };
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
	    0: 'change_recovery_account';
	    1: {
	        /**
	         * The account that would be recovered in case of compromise.
	         */
	        account_to_recover: string;
	        /**
	         * The account that creates the recover request.
	         */
	        new_recovery_account: string;
	        /**
	         * Extensions. Not currently used.
	         */
	        extensions: any[];
	    };
	}
	export interface ClaimRewardBalanceOperation extends Operation {
	    0: 'claim_reward_balance';
	    1: {
	        account: string;
	        reward_yang: string | Asset;
	        reward_qi: string | Asset;
	        reward_feigang: string | Asset;
	    };
	}
	export interface CustomOperation extends Operation {
	    0: 'custom';
	    1: {
	        required_auths: string[];
	        id: number;
	        data: Buffer | HexBuffer | number[];
	    };
	}
	export interface CustomJsonOperation extends Operation {
	    0: 'custom_json';
	    1: {
	        required_auths: string[];
	        required_posting_auths: string[];
	        /**
	         * ID string, must be less than 32 characters long.
	         */
	        id: string;
	        /**
	         * JSON encoded string, must be valid JSON.
	         */
	        json: string;
	    };
	}
	export interface DeclineAdoringRightsOperation extends Operation {
	    0: 'decline_adoring_rights';
	    1: {
	        account: string;
	        decline: boolean;
	    };
	}
	export interface DelegateQiOperation extends Operation {
	    0: 'delegate_qi';
	    1: {
	        /**
	         * The account delegating qi.
	         */
	        delegator: string;
	        /**
	         * The account receiving qi.
	         */
	        delegatee: string;
	        /**
	         * The amount of qi delegated.
	         */
	        qi: string | Asset;
	    };
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
	    0: 'recover_account';
	    1: {
	        /**
	         * The account to be recovered.
	         */
	        account_to_recover: string;
	        /**
	         * The new owner authority as specified in the request account recovery operation.
	         */
	        new_owner_authority: AuthorityType;
	        /**
	         * A previous owner authority that the account holder will use to prove
	         * past ownership of the account to be recovered.
	         */
	        recent_owner_authority: AuthorityType;
	        /**
	         * Extensions. Not currently used.
	         */
	        extensions: any[];
	    };
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
	    0: 'request_account_recovery';
	    1: {
	        /**
	         * The recovery account is listed as the recovery account on the account to recover.
	         */
	        recovery_account: string;
	        /**
	         * The account to recover. This is likely due to a compromised owner authority.
	         */
	        account_to_recover: string;
	        /**
	         * The new owner authority the account to recover wishes to have. This is secret
	         * known by the account to recover and will be confirmed in a recover_account_operation.
	         */
	        new_owner_authority: AuthorityType;
	        /**
	         * Extensions. Not currently used.
	         */
	        extensions: any[];
	    };
	}
	/**
	 * Allows an account to setup a qi withdraw but with the additional
	 * request for the funds to be transferred directly to another account's
	 * balance rather than the withdrawing account. In addition, those funds
	 * can be immediately vested again, circumventing the conversion from
	 * qi to yang and back, guaranteeing they maintain their value.
	 */
	export interface SetWithdrawQiOperation extends Operation {
	    0: 'set_withdraw_qi_route';
	    1: {
	        from_account: string;
	        to_account: string;
	        percent: number;
	        auto_vest: boolean;
	    };
	}
	/**
	 * Transfers YANG from one account to another.
	 */
	export interface TransferOperation extends Operation {
	    0: 'transfer';
	    1: {
	        /**
	         * Sending account name.
	         */
	        from: string;
	        /**
	         * Receiving account name.
	         */
	        to: string;
	        /**
	         * Amount of YANG or GOLD... to send.
	         */
	        amount: string | Asset;
	        /**
	         * Plain-text note attached to transaction.
	         */
	        memo: string;
	    };
	}
	/**
	 * This operation converts YANG into Qi at
	 * the current exchange rate. With this operation it is possible to
	 * give another account qi so that faucets can
	 * pre-fund new accounts with qi.
	 * (A.k.a. Powering Up)
	 */
	export interface TransferToQiOperation extends Operation {
	    0: 'transfer_to_qi';
	    1: {
	        from: string;
	        to: string;
	        /**
	         * Amount to power up, must be YANG.
	         */
	        amount: string | Asset;
	    };
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
	    0: 'withdraw_qi';
	    1: {
	        account: string;
	        /**
	         * Amount to power down, must be QI.
	         */
	        qi: string | Asset;
	    };
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
	    0: 'siming_update';
	    1: {
	        owner: string;
	        /**
	         * URL for simming, usually a link to a post in the siming-category tag.
	         */
	        url: string;
	        block_signing_key: string | PublicKey | null;
	        props: ChainProperties;
	        /**
	         * The fee paid to register a new siming, should be 10x current block production pay.
	         */
	        fee: string | Asset;
	    };
	}
	export interface SimingSetPropertiesOperation extends Operation {
	    0: 'siming_set_properties';
	    1: {
	        owner: string;
	        props: Array<[string, Buffer]>;
	        extensions: any[];
	    };
	}

}
declare module 'ctaiyi/taiyi/transaction' {
	import { Operation } from 'ctaiyi/taiyi/operation';
	export interface Transaction {
	    ref_block_num: number;
	    ref_block_prefix: number;
	    expiration: string;
	    operations: Operation[];
	    extensions: any[];
	}
	export interface SignedTransaction extends Transaction {
	    signatures: string[];
	}
	export interface TransactionConfirmation {
	    id: string;
	    block_num: number;
	    trx_num: number;
	    expired: boolean;
	}

}
declare module 'ctaiyi/taiyi/block' {
	import { Transaction } from 'ctaiyi/taiyi/transaction';
	/**
	 * Unsigned block header.
	 */
	export interface BlockHeader {
	    previous: string;
	    timestamp: string;
	    siming: string;
	    transaction_merkle_root: string;
	    extensions: any[];
	}
	/**
	 * Signed block header.
	 */
	export interface SignedBlockHeader extends BlockHeader {
	    siming_signature: string;
	}
	/**
	 * Full signed block.
	 */
	export interface SignedBlock extends SignedBlockHeader {
	    block_id: string;
	    signing_key: string;
	    transaction_ids: string[];
	    transactions: Transaction[];
	}

}
declare module 'ctaiyi/helpers/blockchain' {
	/// <reference types="node" />
	import { Client } from 'ctaiyi/client';
	import { BlockHeader, SignedBlock } from 'ctaiyi/taiyi/block';
	import { AppliedOperation } from 'ctaiyi/taiyi/operation';
	export enum BlockchainMode {
	    /**
	     * Only get irreversible blocks.
	     */
	    Irreversible = 0,
	    /**
	     * Get all blocks.
	     */
	    Latest = 1
	}
	export interface BlockchainStreamOptions {
	    /**
	     * Start block number, inclusive. If omitted generation will start from current block height.
	     */
	    from?: number;
	    /**
	     * End block number, inclusive. If omitted stream will continue indefinitely.
	     */
	    to?: number;
	    /**
	     * Streaming mode, if set to `Latest` may include blocks that are not applied to the final chain.
	     * Defaults to `Irreversible`.
	     */
	    mode?: BlockchainMode;
	}
	export class Blockchain {
	    readonly client: Client;
	    constructor(client: Client);
	    /**
	     * Get latest block number.
	     */
	    getCurrentBlockNum(mode?: BlockchainMode): Promise<number>;
	    /**
	     * Get latest block header.
	     */
	    getCurrentBlockHeader(mode?: BlockchainMode): Promise<BlockHeader>;
	    /**
	     * Get latest block.
	     */
	    getCurrentBlock(mode?: BlockchainMode): Promise<SignedBlock>;
	    /**
	     * Return a asynchronous block number iterator.
	     * @param options Feed options, can also be a block number to start from.
	     */
	    getBlockNumbers(options?: BlockchainStreamOptions | number): AsyncGenerator<number, void, unknown>;
	    /**
	     * Return a stream of block numbers, accepts same parameters as {@link getBlockNumbers}.
	     */
	    getBlockNumberStream(options?: BlockchainStreamOptions | number): NodeJS.ReadableStream;
	    /**
	     * Return a asynchronous block iterator, accepts same parameters as {@link getBlockNumbers}.
	     */
	    getBlocks(options?: BlockchainStreamOptions | number): AsyncGenerator<SignedBlock, void, unknown>;
	    /**
	     * Return a stream of blocks, accepts same parameters as {@link getBlockNumbers}.
	     */
	    getBlockStream(options?: BlockchainStreamOptions | number): NodeJS.ReadableStream;
	    /**
	     * Return a asynchronous operation iterator, accepts same parameters as {@link getBlockNumbers}.
	     */
	    getOperations(options?: BlockchainStreamOptions | number): AsyncGenerator<AppliedOperation, void, unknown>;
	    /**
	     * Return a stream of operations, accepts same parameters as {@link getBlockNumbers}.
	     */
	    getOperationsStream(options?: BlockchainStreamOptions | number): NodeJS.ReadableStream;
	}

}
declare module 'ctaiyi/helpers/broadcast' {
	import { Client } from 'ctaiyi/client';
	import { PrivateKey, PublicKey } from 'ctaiyi/crypto';
	import { AuthorityType } from 'ctaiyi/taiyi/account';
	import { Asset } from 'ctaiyi/taiyi/asset';
	import { AccountUpdateOperation, CustomJsonOperation, DelegateQiOperation, Operation, TransferOperation } from 'ctaiyi/taiyi/operation';
	import { SignedTransaction, Transaction, TransactionConfirmation } from 'ctaiyi/taiyi/transaction';
	export interface CreateAccountOptions {
	    /**
	     * Username for the new account.
	     */
	    username: string;
	    /**
	     * Password for the new account, if set, all keys will be derived from this.
	     */
	    password?: string;
	    /**
	     * Account authorities, used to manually set account keys.
	     * Can not be used together with the password option.
	     */
	    auths?: {
	        owner: AuthorityType | string | PublicKey;
	        active: AuthorityType | string | PublicKey;
	        posting: AuthorityType | string | PublicKey;
	        memoKey: PublicKey | string;
	    };
	    /**
	     * Creator account, fee will be deducted from this and the key to sign
	     * the transaction must be the creators active key.
	     */
	    creator: string;
	    /**
	     * Account creation fee. If omitted fee will be set to lowest possible.
	     */
	    fee?: string | Asset | number;
	    /**
	     * Optional account meta-data.
	     */
	    metadata?: {
	        [key: string]: any;
	    };
	}
	export class BroadcastAPI {
	    readonly client: Client;
	    /**
	     * How many milliseconds in the future to set the expiry time to when
	     * broadcasting a transaction, defaults to 1 minute.
	     */
	    expireTime: number;
	    constructor(client: Client);
	    /**
	     * Broadcast a transfer.
	     * @param data The transfer operation payload.
	     * @param key Private active key of sender.
	     */
	    transfer(data: TransferOperation[1], key: PrivateKey): Promise<TransactionConfirmation>;
	    /**
	     * Broadcast custom JSON.
	     * @param data The custom_json operation payload.
	     * @param key Private posting or active key.
	     */
	    json(data: CustomJsonOperation[1], key: PrivateKey): Promise<TransactionConfirmation>;
	    /**
	     * Create a new account on testnet.
	     * @param options New account options.
	     * @param key Private active key of account creator.
	     */
	    createTestAccount(options: CreateAccountOptions, key: PrivateKey): Promise<TransactionConfirmation>;
	    /**
	     * Update account.
	     * @param data The account_update payload.
	     * @param key The private key of the account affected, should be the corresponding
	     *            key level or higher for updating account authorities.
	     */
	    updateAccount(data: AccountUpdateOperation[1], key: PrivateKey): Promise<TransactionConfirmation>;
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
	    delegateQi(options: DelegateQiOperation[1], key: PrivateKey): Promise<TransactionConfirmation>;
	    /**
	     * Sign and broadcast transaction with operations to the network. Throws if the transaction expires.
	     * @param operations List of operations to send.
	     * @param key Private key(s) used to sign transaction.
	     */
	    sendOperations(operations: Operation[], key: PrivateKey | PrivateKey[]): Promise<TransactionConfirmation>;
	    /**
	     * Sign a transaction with key(s).
	     */
	    sign(transaction: Transaction, key: PrivateKey | PrivateKey[]): SignedTransaction;
	    /**
	     * Broadcast a signed transaction to the network.
	     */
	    send(transaction: SignedTransaction): Promise<TransactionConfirmation>;
	    /**
	     * Convenience for calling `baiyujing_api`.
	     */
	    call(method: string, params?: any[]): Promise<any>;
	}

}
declare module 'ctaiyi/helpers/database' {
	import { Client } from 'ctaiyi/client';
	import { ExtendedAccount } from 'ctaiyi/taiyi/account';
	import { BlockHeader, SignedBlock } from 'ctaiyi/taiyi/block';
	import { DynamicGlobalProperties } from 'ctaiyi/taiyi/misc';
	import { ChainProperties, QiDelegation } from 'ctaiyi/taiyi/misc';
	import { AppliedOperation } from 'ctaiyi/taiyi/operation';
	import { SignedTransaction, TransactionConfirmation } from 'ctaiyi/taiyi/transaction';
	export class DatabaseAPI {
	    readonly client: Client;
	    constructor(client: Client);
	    /**
	     * Convenience for calling `database_api`.
	     */
	    call(method: string, params?: any[]): Promise<any>;
	    /**
	     * Return state of server.
	     */
	    getDynamicGlobalProperties(): Promise<DynamicGlobalProperties>;
	    /**
	     * Return median chain properties decided by siming.
	     */
	    getChainProperties(): Promise<ChainProperties>;
	    /**
	     * Return all of the state required for a particular url path.
	     * @param path Path component of url conforming to condenser's scheme
	     *             e.g. `@almost-digital` or `trending/travel`
	     */
	    getState(path: string): Promise<any>;
	    /**
	     * Get list of delegations made by account.
	     * @param account Account delegating
	     * @param from Delegatee start offset, used for paging.
	     * @param limit Number of results, max 1000.
	     */
	    getQiDelegations(account: string, from?: string, limit?: number): Promise<QiDelegation[]>;
	    /**
	     * Return server config. See:
	     * https://github.com/hongzhongx/taiyi/blob/main/libraries/protocol/config.hpp
	     */
	    getConfig(): Promise<{
	        [name: string]: string | number | boolean;
	    }>;
	    /**
	     * Return header for *blockNum*.
	     */
	    getBlockHeader(blockNum: number): Promise<BlockHeader>;
	    /**
	     * Return block *blockNum*.
	     */
	    getBlock(blockNum: number): Promise<SignedBlock>;
	    /**
	     * Return all applied operations in *blockNum*.
	     */
	    getOperations(blockNum: number, onlyVirtual?: boolean): Promise<AppliedOperation[]>;
	    /**
	     * Return array of account info objects for the usernames passed.
	     * @param usernames The accounts to fetch.
	     */
	    getAccounts(usernames: string[]): Promise<ExtendedAccount[]>;
	    /**
	     * Convenience to fetch a block and return a specific transaction.
	     */
	    getTransaction(txc: TransactionConfirmation | {
	        block_num: number;
	        id: string;
	    }): Promise<SignedTransaction>;
	    /**
	     * Verify signed transaction.
	     */
	    verifyAuthority(stx: SignedTransaction): Promise<boolean>;
	}

}
declare module 'ctaiyi/client' {
	/// <reference types="node" />
	import { Blockchain } from 'ctaiyi/helpers/blockchain';
	import { BroadcastAPI } from 'ctaiyi/helpers/broadcast';
	import { DatabaseAPI } from 'ctaiyi/helpers/database';
	/**
	 * Library version.
	 */
	export const VERSION: string;
	/**
	 * Main taiyi network chain id.
	 */
	export const DEFAULT_CHAIN_ID: Buffer;
	/**
	 * Main taiyi network address prefix.
	 */
	export const DEFAULT_ADDRESS_PREFIX = "TAI";
	/**
	 * RPC Client options
	 * ------------------
	 */
	export interface ClientOptions {
	    /**
	     * Taiyi chain id. Defaults to main taiyi network:
	     * `0000000000000000000000000000000000000000000000000000000000000000`
	     */
	    chainId?: string;
	    /**
	     * Taiyi address prefix. Defaults to main taiyi network:
	     * `TAI`
	     */
	    addressPrefix?: string;
	    /**
	     * Send timeout, how long to wait in milliseconds before giving
	     * up on a rpc call. Note that this is not an exact timeout,
	     * no in-flight requests will be aborted, they will just not
	     * be retried any more past the timeout.
	     * Can be set to 0 to retry forever. Defaults to 60 * 1000 ms.
	     */
	    timeout?: number;
	    /**
	     * Retry backoff function, returns milliseconds. Default = {@link defaultBackoff}.
	     */
	    backoff?: (tries: number) => number;
	    /**
	     * Node.js http(s) agent, use if you want http keep-alive.
	     * Defaults to using https.globalAgent.
	     * @see https://nodejs.org/api/http.html#http_new_agent_options.
	     */
	    agent?: any;
	}
	/**
	 * RPC Client
	 * ----------
	 * Can be used in both node.js and the browser. Also see {@link ClientOptions}.
	 */
	export class Client {
	    /**
	     * Create a new client instance configured for the testnet.
	     */
	    static testnet(options?: ClientOptions): Client;
	    /**
	     * Client options, *read-only*.
	     */
	    readonly options: ClientOptions;
	    /**
	     * Address to Taiyi RPC server, *read-only*.
	     */
	    readonly address: string;
	    /**
	     * Database API helper.
	     */
	    readonly database: DatabaseAPI;
	    /**
	     * Broadcast API helper.
	     */
	    readonly broadcast: BroadcastAPI;
	    /**
	     * Blockchain helper.
	     */
	    readonly blockchain: Blockchain;
	    /**
	     * Chain ID for current network.
	     */
	    readonly chainId: Buffer;
	    /**
	     * Address prefix for current network.
	     */
	    readonly addressPrefix: string;
	    private timeout;
	    private backoff;
	    /**
	     * @param address The address to the Taiyi RPC server, e.g. `https://api.taiyi.com`.
	     * @param options Client options.
	     */
	    constructor(address: string, options?: ClientOptions);
	    /**
	     * Make a RPC call to the server.
	     *
	     * @param api     The API to call, e.g. `database_api`.
	     * @param method  The API method, e.g. `get_dynamic_global_properties`.
	     * @param params  Array of parameters to pass to the method, optional.
	     *
	     */
	    call(api: string, method: string, params?: any): Promise<any>;
	}

}
declare module 'ctaiyi' {
	/**
	 * @file ctaiyi exports.
	 */
	import * as utils from 'ctaiyi/utils';
	export { utils };
	export * from 'ctaiyi/helpers/blockchain';
	export * from 'ctaiyi/helpers/database';
	export * from 'ctaiyi/taiyi/account';
	export * from 'ctaiyi/taiyi/asset';
	export * from 'ctaiyi/taiyi/block';
	export * from 'ctaiyi/taiyi/misc';
	export * from 'ctaiyi/taiyi/operation';
	export * from 'ctaiyi/taiyi/serializer';
	export * from 'ctaiyi/taiyi/transaction';
	export * from 'ctaiyi/client';
	export * from 'ctaiyi/crypto';

}
declare module 'ctaiyi/index-browser' {
	/**
	 * @file ctaiyi entry point for browsers.
	 */
	import 'regenerator-runtime/runtime';
	import 'core-js/es6/map';
	import 'core-js/es6/number';
	import 'core-js/es6/promise';
	import 'core-js/es6/symbol';
	import 'core-js/fn/array/from';
	import 'core-js/modules/es7.symbol.async-iterator';
	import 'whatwg-fetch';
	export * from 'ctaiyi';

}
declare module 'ctaiyi/index-node' {
	/**
	 * @file ctaiyi entry point for node.js.
	 */
	import 'core-js/modules/es7.symbol.async-iterator';
	export * from 'ctaiyi';

}
