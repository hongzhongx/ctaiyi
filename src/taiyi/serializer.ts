import type { Operation } from './operation'
import * as ByteBuffer from 'bytebuffer'
import { PublicKey } from '../crypto'
import { Asset } from './asset'
import { HexBuffer } from './misc'

export type Serializer<Type = any> = (buffer: ByteBuffer, data: Type) => void

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

type CoverUnionSerializerToObject<S> = UnionToIntersection<S extends [infer K extends string, Serializer<infer V>]
  ? { [P in K]: V }
  : never>

function VoidSerializer(_buffer: ByteBuffer) {
  throw new Error('Void can not be serialized')
}

function StringSerializer(buffer: ByteBuffer, data: string) {
  buffer.writeVString(data)
}

function Int8Serializer(buffer: ByteBuffer, data: number) {
  buffer.writeInt8(data)
}

function Int16Serializer(buffer: ByteBuffer, data: number) {
  buffer.writeInt16(data)
}

function Int32Serializer(buffer: ByteBuffer, data: number) {
  buffer.writeInt32(data)
}

function Int64Serializer(buffer: ByteBuffer, data: number) {
  buffer.writeInt64(data)
}

function UInt8Serializer(buffer: ByteBuffer, data: number) {
  buffer.writeUint8(data)
}

function UInt16Serializer(buffer: ByteBuffer, data: number) {
  buffer.writeUint16(data)
}

function UInt32Serializer(buffer: ByteBuffer, data: number) {
  buffer.writeUint32(data)
}

function UInt64Serializer(buffer: ByteBuffer, data: number) {
  buffer.writeUint64(data)
}

function BooleanSerializer(buffer: ByteBuffer, data: boolean) {
  buffer.writeByte(data ? 1 : 0)
}

function StaticVariantSerializer(itemSerializers: Serializer[]) {
  return (buffer: ByteBuffer, data: [id: number, item: any]) => {
    const [id, item] = data
    buffer.writeVarint32(id)
    itemSerializers[id](buffer, item)
  }
}

/**
 * 序列化资产。
 * @note 对于大于 `2^53-1/10^precision` 的数额会失去精度。在实际使用中不应成为问题。
 */
function AssetSerializer(buffer: ByteBuffer, data: Asset | string | number) {
  const asset = Asset.from(data)

  const precision = asset.getPrecision()
  if (asset.isFai) {
    // @ts-expect-error wrong type in @type/bytebuffer package
    const LongConstructor = ByteBuffer.Long as typeof Long
    // const faiNumPart = Number.parseInt(Asset.getFaiFromSymbol(asset.symbol).slice(2))

    // const fai = Math.floor(faiNumPart / 10)
    const towrite = LongConstructor.fromString(asset.amount.toString())
    buffer.writeInt64(towrite)
    // const write32 = (fai << 5) + 16 + asset.getPrecision()
    // buffer.writeUint32(write32)
  }
  else {
    buffer.writeInt64(Math.round(asset.amount * 10 ** precision))
  }

  buffer.writeUint8(precision)
  buffer.append(asset.symbol.toUpperCase(), 'binary')
  for (let i = 0; i < 7 - asset.symbol.length; i++) {
    buffer.writeUint8(0)
  }
}

function DateSerializer(buffer: ByteBuffer, data: string) {
  buffer.writeUint32(Math.floor(new Date(`${data}Z`).getTime() / 1000))
}

function PublicKeySerializer(buffer: ByteBuffer, data: PublicKey | string | null) {
  if (data === null || (typeof data === 'string' && data.slice(-39) === '1111111111111111111111111111111114T1Anm')) {
    buffer.append(new Uint8Array(33))
  }
  else {
    buffer.append(PublicKey.from(data).key)
  }
}

function BinarySerializer(size?: number) {
  return (buffer: ByteBuffer, data: Uint8Array | HexBuffer) => {
    data = HexBuffer.from(data)
    const len = data.buffer.length
    if (size) {
      if (len !== size) {
        throw new Error(`Unable to serialize binary. Expected ${size} bytes, got ${len}`)
      }
    }
    else {
      buffer.writeVarint32(len)
    }
    buffer.append(data.buffer)
  }
}

const VariableBinarySerializer = BinarySerializer()

function FlatMapSerializer<K, V>(keySerializer: Serializer<K>, valueSerializer: Serializer<V>) {
  return (buffer: ByteBuffer, data: Array<[K, V]>) => {
    buffer.writeVarint32(data.length)
    for (const [key, value] of data) {
      keySerializer(buffer, key)
      valueSerializer(buffer, value)
    }
  }
}

function ArraySerializer<T>(itemSerializer: Serializer<T>) {
  return (buffer: ByteBuffer, data: T[]) => {
    buffer.writeVarint32(data.length)
    for (const item of data) {
      itemSerializer(buffer, item)
    }
  }
}

function ObjectSerializer<
  const Definitions extends Array<[string, Serializer<any>]>,
>(keySerializers: [...Definitions]): Serializer<CoverUnionSerializerToObject<Definitions[number]>> {
  return (buffer: ByteBuffer, data: CoverUnionSerializerToObject<Definitions[number]>) => {
    for (const [key, serializer] of keySerializers) {
      try {
        serializer(buffer, (<any>data)[key])
      }
      catch (error: any) {
        error.message = `${key}: ${error.message}`
        throw error
      }
    }
  }
}

function OptionalSerializer(valueSerializer: Serializer) {
  return (buffer: ByteBuffer, data: any) => {
    if (data !== undefined && data !== null) {
      buffer.writeByte(1)
      valueSerializer(buffer, data)
    }
    else {
      buffer.writeByte(0)
    }
  }
}

const AuthoritySerializer = ObjectSerializer([
  ['weight_threshold', UInt32Serializer],
  ['account_auths', FlatMapSerializer(StringSerializer, UInt16Serializer)],
  ['key_auths', FlatMapSerializer(PublicKeySerializer, UInt16Serializer)],
])

const PriceSerializer = ObjectSerializer([
  ['base', AssetSerializer],
  ['quote', AssetSerializer],
])

const ChainPropertiesSerializer = ObjectSerializer([
  ['account_creation_fee', AssetSerializer],
  ['maximum_block_size', UInt32Serializer],
  ['sbd_interest_rate', UInt16Serializer],
])

function OperationDataSerializer<
  const Definitions extends Array<[string, Serializer<any>]>,
>(operationId: number, definitions: [...Definitions]) {
  const objectSerializer = ObjectSerializer<Definitions>(definitions)
  return (buffer: ByteBuffer, data: CoverUnionSerializerToObject<Definitions[number]>) => {
    buffer.writeVarint32(operationId)
    objectSerializer(buffer, data)
  }
}

const OperationSerializers = {
  account_create: OperationDataSerializer(0, [
    ['fee', AssetSerializer],
    ['creator', StringSerializer],
    ['new_account_name', StringSerializer],
    ['owner', AuthoritySerializer],
    ['active', AuthoritySerializer],
    ['posting', AuthoritySerializer],
    ['memo_key', PublicKeySerializer],
    ['json_metadata', StringSerializer],
  ]),
  account_update: OperationDataSerializer(1, [
    ['account', StringSerializer],
    ['owner', OptionalSerializer(AuthoritySerializer)],
    ['active', OptionalSerializer(AuthoritySerializer)],
    ['posting', OptionalSerializer(AuthoritySerializer)],
    ['memo_key', PublicKeySerializer],
    ['json_metadata', StringSerializer],
  ]),

  transfer: OperationDataSerializer(2, [
    ['from', StringSerializer],
    ['to', StringSerializer],
    ['amount', AssetSerializer],
    ['memo', StringSerializer],
  ]),
  transfer_to_qi: OperationDataSerializer(3, [
    ['from', StringSerializer],
    ['to', StringSerializer],
    ['amount', AssetSerializer],
  ]),
  withdraw_qi: OperationDataSerializer(4, [
    ['from', StringSerializer],
    ['to', StringSerializer],
    ['amount', AssetSerializer],
  ]),
  set_withdraw_qi_route: OperationDataSerializer(5, [
    ['from_account', StringSerializer],
    ['to_account', StringSerializer],
    ['percent', UInt16Serializer],
    ['auto_vest', BooleanSerializer],
  ]),
  delegate_qi: OperationDataSerializer(6, [
    ['delegator', StringSerializer],
    ['delegatee', StringSerializer],
    ['qi', AssetSerializer],
  ]),

  siming_update: OperationDataSerializer(7, [
    ['owner', StringSerializer],
    ['url', StringSerializer],
    ['block_signing_key', PublicKeySerializer],
    ['props', ChainPropertiesSerializer],
    ['fee', AssetSerializer],
  ]),
  siming_set_properties: OperationDataSerializer(8, [
    ['owner', StringSerializer],
    ['props', ChainPropertiesSerializer],
    ['extensions', ArraySerializer(VoidSerializer)],
  ]),
  account_siming_adore: OperationDataSerializer(9, [
    ['amount', StringSerializer],
    ['siming', StringSerializer],
    ['approve', BooleanSerializer],
  ]),
  account_siming_proxy: OperationDataSerializer(10, [
    ['account', StringSerializer],
    ['proxy', StringSerializer],
  ]),
  decline_adoring_rights: OperationDataSerializer(11, [
    ['account', StringSerializer],
    ['extensions', ArraySerializer(VoidSerializer)],
  ]),

  custom: OperationDataSerializer(12, [
    ['required_auths', ArraySerializer(StringSerializer)],
    ['id', UInt16Serializer],
    ['data', VariableBinarySerializer],
  ]),
  custom_json: OperationDataSerializer(13, [
    ['required_auths', ArraySerializer(StringSerializer)],
    ['required_posting_auths', ArraySerializer(StringSerializer)],
    ['id', StringSerializer],
    ['json', StringSerializer],
  ]),

  request_account_recovery: OperationDataSerializer(14, [
    ['recovery_account', StringSerializer],
    ['account_to_recover', StringSerializer],
    ['new_owner_authority', AuthoritySerializer],
    ['extensions', ArraySerializer(VoidSerializer)],
  ]),
  recover_account: OperationDataSerializer(15, [
    ['account_to_recover', StringSerializer],
    ['new_owner_authority', AuthoritySerializer],
    ['recent_owner_authority', AuthoritySerializer],
    ['extensions', ArraySerializer(VoidSerializer)],
  ]),
  change_recovery_account: OperationDataSerializer(16, [
    ['account_to_recover', StringSerializer],
    ['new_recovery_account', StringSerializer],
    ['extensions', ArraySerializer(VoidSerializer)],
  ]),

  claim_reward_balance: OperationDataSerializer(17, [
    ['account', StringSerializer],
    ['reward_qi', AssetSerializer],
    ['extensions', ArraySerializer(VoidSerializer)],
  ]),

  // #region contract
  create_contract: OperationDataSerializer(18, [
    ['owner', StringSerializer],
    ['name', StringSerializer],
    ['code', StringSerializer],
    ['abi', StringSerializer],
    ['fee', AssetSerializer],
  ]),
  revise_contract: OperationDataSerializer(19, [
    ['owner', StringSerializer],
    ['name', StringSerializer],
    ['code', StringSerializer],
    ['abi', StringSerializer],
    ['fee', AssetSerializer],
  ]),
  call_contract_function: OperationDataSerializer(20, [
    ['caller', StringSerializer],
    ['contract', StringSerializer],
    ['function', StringSerializer],
    ['params', StringSerializer],
    ['fee', AssetSerializer],
  ]),
  // #endregion

  // #region nfa (non fungible asset)
  create_nfa_symbol: OperationDataSerializer(21, [
    ['owner', StringSerializer],
    ['name', StringSerializer],
    ['maximum_supply', UInt32Serializer],
    ['json_metadata', StringSerializer],
  ]),

  create_nfa: OperationDataSerializer(22, [
    ['creator', StringSerializer],
    ['symbol', StringSerializer],
    ['to', StringSerializer],
    ['uri', StringSerializer],
    ['json_metadata', StringSerializer],
  ]),

  transfer_nfa: OperationDataSerializer(23, [
    ['from', StringSerializer],
    ['to', StringSerializer],
    ['token_id', UInt32Serializer],
    ['memo', StringSerializer],
  ]),

  approve_nfa_active: OperationDataSerializer(24, [
    ['owner', StringSerializer],
    ['approved', StringSerializer],
    ['token_id', UInt32Serializer],
    ['approve', BooleanSerializer],
  ]),

  action_nfa: OperationDataSerializer(25, [
    ['caller', StringSerializer],
    ['id', Int64Serializer],
    ['action', StringSerializer],
    ['value_list', ArraySerializer(StringSerializer)],
    ['extensions', ArraySerializer(StringSerializer)],
  ]),
  // #endregion

  // #region zone
  create_zone: OperationDataSerializer(26, [
    ['owner', StringSerializer],
    ['name', StringSerializer],
    ['json_metadata', StringSerializer],
  ]),
  // #endregion

  // #region actor
  create_actor_talent_rule: OperationDataSerializer(27, [
    ['owner', StringSerializer],
    ['name', StringSerializer],
    ['rule', StringSerializer],
  ]),

  create_actor: OperationDataSerializer(28, [
    ['fee', AssetSerializer],
    ['creator', StringSerializer],
    ['family_name', StringSerializer],
    ['last_name', StringSerializer],
  ]),
  // #endregion

  // #region virtual operations
  hardfork: OperationDataSerializer(29, [
    ['hardfork_id', UInt32Serializer],
  ]),

  fill_qi_withdraw: OperationDataSerializer(30, [
    ['from_account', StringSerializer],
    ['to_account', StringSerializer],
    ['withdrawn', AssetSerializer],
    ['deposited', AssetSerializer],
  ]),

  return_qi_delegation: OperationDataSerializer(31, [
    ['account', StringSerializer],
    ['return_qi_delegation', AssetSerializer],
  ]),

  producer_reward: OperationDataSerializer(32, [
    ['producer', StringSerializer],
    ['qi_reward', AssetSerializer],
  ]),

  nfa_convert_resources: OperationDataSerializer(33, [
    ['owner', StringSerializer],
    ['token_id', UInt32Serializer],
    ['resources', StringSerializer],
  ]),

  nfa_transfer: OperationDataSerializer(34, [
    ['from', StringSerializer],
    ['to', StringSerializer],
    ['token_id', UInt32Serializer],
  ]),

  nfa_deposit_withdraw: OperationDataSerializer(35, [
    ['owner', StringSerializer],
    ['token_id', UInt32Serializer],
    ['amount', AssetSerializer],
  ]),

  reward_feigang: OperationDataSerializer(36, [
    ['account', StringSerializer],
    ['reward', AssetSerializer],
  ]),

  reward_cultivation: OperationDataSerializer(37, [
    ['account', StringSerializer],
    ['reward', AssetSerializer],
  ]),

  tiandao_year_change: OperationDataSerializer(38, [
    ['year', UInt32Serializer],
  ]),

  tiandao_month_change: OperationDataSerializer(39, [
    ['month', UInt32Serializer],
  ]),

  tiandao_time_change: OperationDataSerializer(40, [
    ['time', UInt32Serializer],
  ]),

  actor_born: OperationDataSerializer(41, [
    ['actor_id', UInt32Serializer],
    ['owner', StringSerializer],
    ['json_metadata', StringSerializer],
  ]),

  actor_talent_trigger: OperationDataSerializer(42, [
    ['actor_id', UInt32Serializer],
    ['talent', StringSerializer],
    ['params', StringSerializer],
  ]),

  actor_movement: OperationDataSerializer(43, [
    ['actor_id', UInt32Serializer],
    ['from_zone', UInt32Serializer],
    ['to_zone', UInt32Serializer],
  ]),

  actor_grown: OperationDataSerializer(44, [
    ['actor_id', UInt32Serializer],
    ['growth', StringSerializer],
  ]),

  narrate_log: OperationDataSerializer(45, [
    ['narrator', StringSerializer],
    ['content', StringSerializer],
  ]),
  // #endregion
} satisfies Record<Operation['0'], Serializer>

function OperationSerializer(buffer: ByteBuffer, operation: Operation) {
  const serializer = OperationSerializers[operation[0]]
  if (!serializer) {
    throw new Error(`No serializer for operation: ${operation[0]}`)
  }
  try {
    serializer(buffer, operation[1] as any)
  }
  catch (error: any) {
    error.message = `${operation[0]}: ${error.message}`
    throw error
  }
}

const TransactionSerializer = ObjectSerializer([
  ['ref_block_num', UInt16Serializer],
  ['ref_block_prefix', UInt32Serializer],
  ['expiration', DateSerializer],
  ['operations', ArraySerializer(OperationSerializer)],
  ['extensions', ArraySerializer(StringSerializer)],
])

export const Types = {
  Array: ArraySerializer,
  Asset: AssetSerializer,
  Authority: AuthoritySerializer,
  Binary: BinarySerializer,
  Boolean: BooleanSerializer,
  Date: DateSerializer,
  FlatMap: FlatMapSerializer,
  Int16: Int16Serializer,
  Int32: Int32Serializer,
  Int64: Int64Serializer,
  Int8: Int8Serializer,
  Object: ObjectSerializer,
  Operation: OperationSerializer,
  Optional: OptionalSerializer,
  Price: PriceSerializer,
  PublicKey: PublicKeySerializer,
  StaticVariant: StaticVariantSerializer,
  String: StringSerializer,
  Transaction: TransactionSerializer,
  UInt16: UInt16Serializer,
  UInt32: UInt32Serializer,
  UInt64: UInt64Serializer,
  UInt8: UInt8Serializer,
  Void: VoidSerializer,
} satisfies Record<string, Serializer | ((...args: any[]) => Serializer)>
