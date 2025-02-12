import type { Operation, Serializer } from './../src'
import { bytesToHex } from '@noble/hashes/utils'

import ByteBuffer from 'bytebuffer'
import { WebSocketTransport } from '../src/transport'
import { Authority, Client, PrivateKey, Types } from './../src'
import { randomString, TEST_CONFIG } from './common'

async function dumpOperataionHex(op: Operation, client: Client) {
  function tempSerialize(serializer: Serializer, data: any) {
    const buffer = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
    serializer(buffer, data)
    buffer.flip()
    return new Uint8Array(buffer.toArrayBuffer())
  }
  try {
    const preparedTrx = await client.broadcast.prepareTransaction({
      operations: [op],
    })

    const serializedTrx = tempSerialize(Types.Transaction, preparedTrx)
    const hex = await client.baiyujing.getTransactionHex(preparedTrx)

    const serializedHex = bytesToHex(serializedTrx)

    return [hex, `${serializedHex}00`] as const
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.dir((e as Error).cause, { depth: null })
    throw e
  }
}

vi.setConfig({
  testTimeout: 60 * 1000,
})

const client = Client.testnet(TEST_CONFIG)

describe.runIf(client.transport instanceof WebSocketTransport)('websocket transport', () => {
  it('should connect', async () => {
    await client.connect()
  })
})

describe('operations', () => {
  it('should serialize account_create operation correctly', async () => {
    const username = `ds-${randomString(12)}`
    const password = randomString(32)
    const privateKey = PrivateKey.fromLogin(username, password)
    const public_key = privateKey.createPublic('TAI').toString()
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'account_create',
      {
        fee: '0.001 YANG',
        creator: 'initminer',
        new_account_name: username,
        owner: Authority.from(public_key),
        active: Authority.from(public_key),
        posting: Authority.from(public_key),
        memo_key: public_key,
        json_metadata: '{ "ctaiyi-test": true }',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize account_update operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'account_update',
      {
        account: 'initminer',
        memo_key: 'TAI6LLegbAgLAy28EHrffBVuANFWcFgmqRMW13wBmTExqFE9SCkg4',
        json_metadata: '{ "ctaiyi-test": true }',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize transfer operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'transfer',
      {
        from: 'initminer',
        to: 'initminer',
        amount: '1.000000 QI',
        memo: 'test',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize transfer_to_qi operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'transfer_to_qi',
      {
        from: 'initminer',
        to: 'initminer',
        amount: '1.000000 QI',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize withdraw_qi operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'withdraw_qi',
      {
        qi: '0.100000 QI',
        account: 'initminer',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize set_withdraw_qi_route operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'set_withdraw_qi_route',
      {
        from_account: 'initminer',
        to_account: 'initminer',
        percent: 100,
        auto_vest: true,
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize delegate_qi operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'delegate_qi',
      {
        delegator: 'initminer',
        delegatee: 'initminer',
        qi: '0.100000 QI',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize siming_update operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'siming_update',
      {
        owner: 'initminer',
        url: 'https://ctaiyi.com',
        block_signing_key: 'TAI6LLegbAgLAy28EHrffBVuANFWcFgmqRMW13wBmTExqFE9SCkg4',
        props: {
          account_creation_fee: '0.001 YANG',
          maximum_block_size: 10240,
        },
        fee: '0.001 YANG',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize siming_set_properties operation correctly', async () => {
    const op: Operation = [
      'siming_set_properties',
      {
        owner: 'initminer',
        block_signing_key: 'TAI6LLegbAgLAy28EHrffBVuANFWcFgmqRMW13wBmTExqFE9SCkg4',
        props: [
          ['account_creation_fee', '0.001 YANG'],
          ['key', 'TAI6LLegbAgLAy28EHrffBVuANFWcFgmqRMW13wBmTExqFE9SCkg4'],
          ['maximum_block_size', 10240],
        ],
        extensions: [],
      },
    ]
    const [dumpHex, serializedHex] = await dumpOperataionHex(op, client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize account_siming_adore operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'account_siming_adore',
      {
        account: 'initminer',
        siming: 'initminer',
        approve: true,
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize account_siming_proxy operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'account_siming_proxy',
      {
        account: 'initminer',
        proxy: 'initminer',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize decline_adoring_rights operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'decline_adoring_rights',
      {
        account: 'initminer',
        decline: true,
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize custom operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'custom',
      {
        required_auths: ['initminer'],
        required_posting_auths: [],
        id: 0,
        data: new TextEncoder().encode('{"foo":"bar"}'),
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize custom_json operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'custom_json',
      {
        required_auths: ['initminer'],
        required_posting_auths: [],
        id: 'something',
        json: JSON.stringify({ foo: 'bar' }),
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize request_account_recovery operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'request_account_recovery',
      {
        recovery_account: 'initminer',
        account_to_recover: 'initminer',
        new_owner_authority: Authority.from('TAI6LLegbAgLAy28EHrffBVuANFWcFgmqRMW13wBmTExqFE9SCkg4'),
        extensions: [],
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize recover_account operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'recover_account',
      {
        account_to_recover: 'initminer',
        new_owner_authority: Authority.from('TAI6LLegbAgLAy28EHrffBVuANFWcFgmqRMW13wBmTExqFE9SCkg4'),
        recent_owner_authority: Authority.from('TAI6LLegbAgLAy28EHrffBVuANFWcFgmqRMW13wBmTExqFE9SCkg4'),
        extensions: [],
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize change_recovery_account operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'change_recovery_account',
      {
        account_to_recover: 'initminer',
        new_recovery_account: 'initminer',
        extensions: [],
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize claim_reward_balance operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'claim_reward_balance',
      {
        account: 'initminer',
        // NOTE: if account reward is 0, the asset symbol will be treat as YANG
        reward_qi: '0.000 YANG',
        reward_yang: '0.000 YANG',
        reward_feigang: '0.000000 QI',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize create_contract operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'create_contract',
      {
        owner: 'initminer',
        name: 'contract.nfa.base',
        data: '0x',
        contract_authority: 'TAI6LLegbAgLAy28EHrffBVuANFWcFgmqRMW13wBmTExqFE9SCkg4',
        extensions: [],
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize revise_contract operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'revise_contract',
      {
        reviser: 'initminer',
        contract_name: 'contract.nfa.base',
        data: '0x',
        extensions: [],
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize call_contract_function operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'call_contract_function',
      {
        caller: 'initminer',
        creator: 'initminer',
        contract_name: 'contract.nfa.base',
        function_name: '0x',
        value_list: [],
        extensions: [],
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize create_nfa_symbol operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'create_nfa_symbol',
      {
        creator: 'initminer',
        symbol: '0x',
        describe: '0x',
        default_contract: 'contract.nfa.base',
        extensions: [],
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize transfer_to_nfa operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'create_nfa',
      {
        creator: 'initminer',
        symbol: '0x',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize transfer_nfa operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'transfer_nfa',
      {
        from: 'initminer',
        to: 'initminer',
        id: 0,
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize approve_nfa_active operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'approve_nfa_active',
      {
        owner: 'initminer',
        active_account: 'initminer',
        id: 0,
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize action_nfa operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'action_nfa',
      {
        caller: 'initminer',
        id: 0,
        action: '0x',
        value_list: [],
        extensions: [],
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize create_actor_talent_rule operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'create_actor_talent_rule',
      {
        creator: 'initminer',
        contract: '0x',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize create_actor operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'create_actor',
      {
        fee: '0.001 YANG',
        creator: 'initminer',
        family_name: '0x',
        last_name: '0x',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize create_zone operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'create_zone',
      {
        fee: '1.000000 QI',
        creator: 'initminer',
        name: '0x',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })
})

describe('virtual operations', () => {
  it('should serialize hardfork operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'hardfork',
      {
        hardfork_id: 0,
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize fill_qi_withdraw operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'fill_qi_withdraw',
      {
        from_account: 'initminer',
        to_account: 'initminer',
        withdrawn: '1.000000 QI',
        deposited: '1.000000 QI',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize return_qi_delegation operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'return_qi_delegation',
      {
        account: 'initminer',
        qi: '1.000000 QI',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize producer_reward operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'producer_reward',
      {
        producer: 'initminer',
        qi: '1.000000 QI',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize nfa_convert_resources operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'nfa_convert_resources',
      {
        nfa: 1,
        owner: 'initminer',
        qi: '1.000000 QI',
        resource: '1.000000 QI',
        is_qi_to_resource: true,
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize nfa_transfer operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'nfa_transfer',
      {
        from: 1,
        from_owner: 'initminer',
        to: 2,
        to_owner: 'initminer',
        amount: '1.000000 QI',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize nfa_deposit_withdraw operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'nfa_deposit_withdraw',
      {
        nfa: 1,
        account: 'initminer',
        deposited: '1.000000 QI',
        withdrawn: '1.000000 QI',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize reward_feigang operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'reward_feigang',
      {
        account: 'initminer',
        qi: '1.000000 QI',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize reward_cultivation operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'reward_cultivation',
      {
        account: 'initminer',
        nfa: 1,
        qi: '1.000000 QI',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize tiandao_year_change operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'tiandao_year_change',
      {
        messager: 'initminer',
        years: 1,
        months: 1,
        times: 1,
        live_num: 100,
        dead_num: 10,
        born_this_year: 20,
        dead_this_year: 5,
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize tiandao_month_change operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'tiandao_month_change',
      {
        messager: 'initminer',
        years: 1,
        months: 1,
        times: 1,
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize tiandao_time_change operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'tiandao_time_change',
      {
        messager: 'initminer',
        years: 1,
        months: 1,
        times: 1,
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize actor_born operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'actor_born',
      {
        owner: 'initminer',
        name: 'actor1',
        zone: 'zone1',
        nfa: 1,
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize actor_talent_trigger operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'actor_talent_trigger',
      {
        owner: 'initminer',
        name: 'actor1',
        nfa: 1,
        tid: 1,
        title: 'talent1',
        desc: 'description',
        age: 18,
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize actor_movement operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'actor_movement',
      {
        owner: 'initminer',
        name: 'actor1',
        from_zone: 'zone1',
        to_zone: 'zone2',
        nfa: 1,
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize actor_grown operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'actor_grown',
      {
        owner: 'initminer',
        name: 'actor1',
        nfa: 1,
        years: 1,
        months: 1,
        times: 1,
        age: 18,
        health: 100,
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })

  it('should serialize narrate_log operation correctly', async () => {
    const [dumpHex, serializedHex] = await dumpOperataionHex([
      'narrate_log',
      {
        narrator: 'initminer',
        years: 1,
        months: 1,
        times: 1,
        log: 'test log',
      },
    ], client)

    expect(dumpHex).toBe(serializedHex)
  })
})
