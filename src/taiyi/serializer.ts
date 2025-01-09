import * as ByteBuffer from 'bytebuffer'
import {PublicKey} from './../crypto'
import {Asset, Price} from './asset'
import {HexBuffer} from './misc'
import {Operation} from './operation'

export type Serializer = (buffer: ByteBuffer, data: any) => void

const VoidSerializer = (buffer: ByteBuffer) => {
    throw new Error('Void can not be serialized')
}

const StringSerializer = (buffer: ByteBuffer, data: string) => {
    buffer.writeVString(data)
}

const Int8Serializer = (buffer: ByteBuffer, data: number) => {
    buffer.writeInt8(data)
}

const Int16Serializer = (buffer: ByteBuffer, data: number) => {
    buffer.writeInt16(data)
}

const Int32Serializer = (buffer: ByteBuffer, data: number) => {
    buffer.writeInt32(data)
}

const Int64Serializer = (buffer: ByteBuffer, data: number) => {
    buffer.writeInt64(data)
}

const UInt8Serializer = (buffer: ByteBuffer, data: number) => {
    buffer.writeUint8(data)
}

const UInt16Serializer = (buffer: ByteBuffer, data: number) => {
    buffer.writeUint16(data)
}

const UInt32Serializer = (buffer: ByteBuffer, data: number) => {
    buffer.writeUint32(data)
}

const UInt64Serializer = (buffer: ByteBuffer, data: number) => {
    buffer.writeUint64(data)
}

const BooleanSerializer = (buffer: ByteBuffer, data: boolean) => {
    buffer.writeByte(data ? 1 : 0)
}

const StaticVariantSerializer = (itemSerializers: Serializer[]) => {
    return (buffer: ByteBuffer, data: [number, any]) => {
        const [id, item] = data
        buffer.writeVarint32(id)
        itemSerializers[id](buffer, item)
    }
}

/**
 * Serialize asset.
 * @note This looses precision for amounts larger than 2^53-1/10^precision.
 *       Should not be a problem in real-word usage.
 */
const AssetSerializer = (buffer: ByteBuffer, data: Asset | string | number) => {
    const asset = Asset.from(data)
    const precision = asset.getPrecision()
    buffer.writeInt64(Math.round(asset.amount * Math.pow(10, precision)))
    buffer.writeUint8(precision)
    for (let i = 0; i < 7; i++) {
        buffer.writeUint8(asset.symbol.charCodeAt(i) || 0)
    }
}

const DateSerializer = (buffer: ByteBuffer, data: string) => {
    buffer.writeUint32(Math.floor(new Date(data + 'Z').getTime() / 1000))
}

const PublicKeySerializer = (buffer: ByteBuffer, data: PublicKey | string | null) => {
    if (data === null || (typeof data === 'string' && data.slice(-39) === '1111111111111111111111111111111114T1Anm')) {
        buffer.append(Buffer.alloc(33, 0))
    } else {
        buffer.append(PublicKey.from(data).key)
    }
}

const BinarySerializer = (size?: number) => {
    return (buffer: ByteBuffer, data: Buffer | HexBuffer) => {
        data = HexBuffer.from(data)
        const len = data.buffer.length
        if (size) {
            if (len !== size) {
                throw new Error(`Unable to serialize binary. Expected ${ size } bytes, got ${ len }`)
            }
        } else {
            buffer.writeVarint32(len)
        }
        buffer.append(data.buffer)
    }
}

const VariableBinarySerializer = BinarySerializer()

const FlatMapSerializer = (keySerializer: Serializer, valueSerializer: Serializer) => {
    return (buffer: ByteBuffer, data: Array<[any, any]>) => {
        buffer.writeVarint32(data.length)
        for (const [key, value] of data) {
            keySerializer(buffer, key)
            valueSerializer(buffer, value)
        }
    }
}

const ArraySerializer = (itemSerializer: Serializer) => {
    return (buffer: ByteBuffer, data: any[]) => {
        buffer.writeVarint32(data.length)
        for (const item of data) {
            itemSerializer(buffer, item)
        }
    }
}

const ObjectSerializer = (keySerializers: Array<[string, Serializer]>) => {
    return (buffer: ByteBuffer, data: {[key: string]: any}) => {
        for (const [key, serializer] of keySerializers) {
            try {
                serializer(buffer, data[key])
            } catch (error) {
                error.message = `${ key }: ${ error.message }`
                throw error
            }
        }
    }
}

const OptionalSerializer = (valueSerializer: Serializer) => {
    return (buffer: ByteBuffer, data: any) => {
        if (data != undefined) {
            buffer.writeByte(1)
            valueSerializer(buffer, data)
        } else {
            buffer.writeByte(0)
        }
    }
}

const AuthoritySerializer = ObjectSerializer([
    ['weight_threshold', UInt32Serializer],
    ['account_auths', FlatMapSerializer(StringSerializer, UInt16Serializer)],
    ['key_auths', FlatMapSerializer(PublicKeySerializer, UInt16Serializer)],
])

const BeneficiarySerializer = ObjectSerializer([
    ['account', StringSerializer],
    ['weight', UInt16Serializer],
])

const PriceSerializer = ObjectSerializer([
    ['base', AssetSerializer],
    ['quote', AssetSerializer],
])

const SignedBlockHeaderSerializer = ObjectSerializer([
    ['previous', BinarySerializer(20)],
    ['timestamp', DateSerializer],
    ['siming', StringSerializer],
    ['transaction_merkle_root', BinarySerializer(20)],
    ['extensions', ArraySerializer(VoidSerializer)],
    ['siming_signature', BinarySerializer(65)],
])

const ChainPropertiesSerializer = ObjectSerializer([
    ['account_creation_fee', AssetSerializer],
    ['maximum_block_size', UInt32Serializer],
])

const OperationDataSerializer = (operationId: number, definitions: Array<[string, Serializer]>) => {
   const objectSerializer = ObjectSerializer(definitions)
   return (buffer: ByteBuffer, data: {[key: string]: any}) => {
        buffer.writeVarint32(operationId)
        objectSerializer(buffer, data)
    }
}

const OperationSerializers: {[name: string]: Serializer} = {}

OperationSerializers.account_create = OperationDataSerializer(9, [
    ['fee', AssetSerializer],
    ['creator', StringSerializer],
    ['new_account_name', StringSerializer],
    ['owner', AuthoritySerializer],
    ['active', AuthoritySerializer],
    ['posting', AuthoritySerializer],
    ['memo_key', PublicKeySerializer],
    ['json_metadata', StringSerializer],
])

OperationSerializers.account_update = OperationDataSerializer(10, [
    ['account', StringSerializer],
    ['owner', OptionalSerializer(AuthoritySerializer)],
    ['active', OptionalSerializer(AuthoritySerializer)],
    ['posting', OptionalSerializer(AuthoritySerializer)],
    ['memo_key', PublicKeySerializer],
    ['json_metadata', StringSerializer],
])

OperationSerializers.account_siming_proxy = OperationDataSerializer(13, [
    ['account', StringSerializer],
    ['proxy', StringSerializer],
])

OperationSerializers.account_siming_adore = OperationDataSerializer(12, [
    ['account', StringSerializer],
    ['siming', StringSerializer],
    ['approve', BooleanSerializer],
])

OperationSerializers.change_recovery_account = OperationDataSerializer(26, [
    ['account_to_recover', StringSerializer],
    ['new_recovery_account', StringSerializer],
    ['extensions', ArraySerializer(VoidSerializer)],
])

OperationSerializers.claim_reward_balance = OperationDataSerializer(39, [
    ['account', StringSerializer],
    ['reward_yang', AssetSerializer],
    ['reward_qi', AssetSerializer],
    ['reward_feigang', AssetSerializer],
])

OperationSerializers.custom = OperationDataSerializer(15, [
    ['required_auths', ArraySerializer(StringSerializer)],
    ['id', UInt16Serializer],
    ['data', VariableBinarySerializer],
])

OperationSerializers.custom_json = OperationDataSerializer(18, [
    ['required_auths', ArraySerializer(StringSerializer)],
    ['required_posting_auths', ArraySerializer(StringSerializer)],
    ['id', StringSerializer],
    ['json', StringSerializer],
])

OperationSerializers.decline_adoring_rights = OperationDataSerializer(36, [
    ['account', StringSerializer],
    ['decline', BooleanSerializer],
])

OperationSerializers.delegate_qi = OperationDataSerializer(40, [
    ['delegator', StringSerializer],
    ['delegatee', StringSerializer],
    ['qi', AssetSerializer],
])

OperationSerializers.recover_account = OperationDataSerializer(25, [
    ['account_to_recover', StringSerializer],
    ['new_owner_authority', AuthoritySerializer],
    ['recent_owner_authority', AuthoritySerializer],
    ['extensions', ArraySerializer(VoidSerializer)],
])

OperationSerializers.request_account_recovery = OperationDataSerializer(24, [
    ['recovery_account', StringSerializer],
    ['account_to_recover', StringSerializer],
    ['new_owner_authority', AuthoritySerializer],
    ['extensions', ArraySerializer(VoidSerializer)],
])

OperationSerializers.set_withdraw_qi_route = OperationDataSerializer(20, [
    ['from_account', StringSerializer],
    ['to_account', StringSerializer],
    ['percent', UInt16Serializer],
    ['auto_vest', BooleanSerializer],
])

OperationSerializers.transfer = OperationDataSerializer(2, [
    ['from', StringSerializer],
    ['to', StringSerializer],
    ['amount', AssetSerializer],
    ['memo', StringSerializer],
])

OperationSerializers.transfer_to_qi = OperationDataSerializer(3, [
    ['from', StringSerializer],
    ['to', StringSerializer],
    ['amount', AssetSerializer],
])

OperationSerializers.withdraw_qi = OperationDataSerializer(4, [
    ['account', StringSerializer],
    ['qi', AssetSerializer],
])

OperationSerializers.siming_update = OperationDataSerializer(11, [
    ['owner', StringSerializer],
    ['url', StringSerializer],
    ['block_signing_key', PublicKeySerializer],
    ['props', ChainPropertiesSerializer],
    ['fee', AssetSerializer],
])

OperationSerializers.siming_set_properties = OperationDataSerializer(42, [
    ['owner', StringSerializer],
    ['props', FlatMapSerializer(StringSerializer, VariableBinarySerializer)],
    ['extensions', ArraySerializer(VoidSerializer)],
])

const OperationSerializer = (buffer: ByteBuffer, operation: Operation) => {
    const serializer = OperationSerializers[operation[0]]
    if (!serializer) {
        throw new Error(`No serializer for operation: ${ operation[0] }`)
    }
    try {
        serializer(buffer, operation[1])
    } catch (error) {
        error.message = `${ operation[0] }: ${ error.message }`
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
}
