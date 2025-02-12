import type { SignedTransaction, Transaction } from '../src'
import { Client } from '../src'
import { WebSocketTransport } from '../src/transport'
import { INITMINER_PRIVATE_KEY, TEST_CONFIG } from './common'

vi.setConfig({
  testTimeout: 100000,
})

const client = Client.testnet(TEST_CONFIG)

if (client.transport instanceof WebSocketTransport) {
  beforeAll(async () => {
    await client.connect()
  })
}

describe('client instance base status', () => {
  it('should exist baiyujing', () => {
    expect(client).toHaveProperty('baiyujing')
  })

  // 创建测试合约，测试 nfa
  afterAll(async () => {
    const code = await client.baiyujing.getContractSourceCode('contract.nfa.base')
    if (!code) {
      const data = `welcome = { consequence = false }
function init_data()
    return {
        foo = 'bar',
    } 
end
function eval_welcome()
    return { 'hello nfa' }
end`
      await client.broadcast.sendOperations(
        [
          [
            'create_contract',
            {
              owner: 'initminer',
              name: 'contract.nfa.base',
              data,
              contract_authority: INITMINER_PRIVATE_KEY.createPublic('TAI').toString(),
              extensions: [],
            },
          ],
        ],
        INITMINER_PRIVATE_KEY,
      )
    }

    const nfas = await client.baiyujing.listNfas('initminer', 1)

    if (!nfas.length) {
      await client.broadcast.sendOperations(
        [
          [
            'create_nfa_symbol',
            {
              creator: 'initminer',
              symbol: 'nfa.test',
              describe: '测试 nfa',
              default_contract: 'contract.nfa.base',
            },
          ],
        ],
        INITMINER_PRIVATE_KEY,
      )

      await client.broadcast.sendOperations(
        [
          [
            'create_nfa',
            {
              symbol: 'nfa.test',
              creator: 'initminer',
            },
          ],
        ],
        INITMINER_PRIVATE_KEY,
      )
    }
  })
})

describe('node and chain information', () => {
  it('should get state', async () => {
    const state = await client.baiyujing.getState()
    expect(state).toHaveProperty('props')
    expect(state.props).toHaveProperty('time')
  })
  it('should get state with simings path', async () => {
    const state = await client.baiyujing.getState('simings')
    expect(state).toHaveProperty('current_route', 'simings')
    expect(state).toHaveProperty('simings', expect.objectContaining({
      initminer: expect.any(Object),
    }))
  })

  it('should get state with account path', async () => {
    const state = await client.baiyujing.getState('@initminer/transfers')
    expect(state).toHaveProperty('current_route', '@initminer/transfers')
    expect(state).toHaveProperty('accounts', expect.objectContaining({
      initminer: expect.objectContaining({
        name: 'initminer',
      }),
    }))
  })

  it('should get siming', async () => {
    const siming = await client.baiyujing.getActiveSimings()
    expect(siming).toBeInstanceOf(Array)
    expect(siming.length).toBe(21)
  })

  it('should get block header', async () => {
    const header = await client.baiyujing.getBlockHeader(1)
    expect(header.previous)
      .toEqual('0000000000000000000000000000000000000000')
  })

  it('should get block', async () => {
    const block = await client.baiyujing.getBlock(1)
    expect(block.previous)
      .toEqual('0000000000000000000000000000000000000000')
    expect(block.transactions).instanceOf(Array)
  })

  it('should get ops in block', async () => {
    const ops = await client.baiyujing.getOperations(1)
    expect(ops).toBeInstanceOf(Array)
    expect(ops.at(0)).toHaveProperty('op')
    expect(ops.at(0)!.op[0]).toBe('producer_reward')
  })

  it('should get config', async () => {
    const config = await client.baiyujing.getConfig()
    expect(config).toHaveProperty('IS_TEST_NET')
  })

  it('should get chain dynamic global properties', async () => {
    const properties = await client.baiyujing.getDynamicGlobalProperties()

    expect(properties).toHaveProperty('head_block_number')
    expect(properties).toHaveProperty('head_block_id')
    expect(properties).toHaveProperty('time')
    expect(properties).toHaveProperty('current_siming')
    expect(properties).toHaveProperty('current_supply')
  })

  it('should get chain properties', async () => {
    const properties = await client.baiyujing.getChainProperties()

    expect(properties).toHaveProperty('account_creation_fee')
    expect(properties).toHaveProperty('maximum_block_size')
  })

  it('should get siming schedule', async () => {
    const schedule = await client.baiyujing.getSimingSchedule()

    expect(schedule).toHaveProperty('id')
    expect(schedule).toHaveProperty('current_shuffled_simings')
    expect(schedule.current_shuffled_simings).toBeInstanceOf(Array)
  })

  it('should get hardfork version', async () => {
    const version = await client.baiyujing.getHardforkVersion()
    expect(version).toBeTypeOf('string')
  })

  it('should get next scheduled hardfork', async () => {
    const next = await client.baiyujing.getNextScheduledHardFork()
    expect(next).toHaveProperty('hf_version')
    expect(next).toHaveProperty('live_time')
  })

  it('should get reward fund', async () => {
    const fund = await client.baiyujing.getRewardFund('cultivation')
    expect(fund).toHaveProperty('id')
    expect(fund).toHaveProperty('name')
    expect(fund).toHaveProperty('reward_balance')
    expect(fund).toHaveProperty('reward_qi_balance')
    expect(fund).toHaveProperty('percent_content_rewards')
    expect(fund).toHaveProperty('last_update')
  })

  it('should get key references', async () => {
    const config = await client.baiyujing.getConfig()
    const references = await client.baiyujing.getKeyReferences([config.TAIYI_INIT_PUBLIC_KEY_STR as string])
    expect(references).toBeDefined()
  })
})

describe('account information', () => {
  it('should get accounts', async () => {
    const accounts = await client.baiyujing.getAccounts(['initminer'])

    expect(accounts).toHaveLength(1)
    expect(accounts[0].name).toBe('initminer')
    expect(accounts[0]).toHaveProperty('other_history')
  })

  it('should lookup account names', async () => {
    const accounts = await client.baiyujing.lookupAccountNames(['initminer'])

    expect(accounts).toHaveLength(1)
    expect(accounts[0].name).toBe('initminer')
  })

  it('should lookup accounts', async () => {
    const accounts = await client.baiyujing.lookupAccounts('initminer', 10)

    expect(accounts).toContain('initminer')
  })

  it('should get accounts count', async () => {
    const count = await client.baiyujing.getAccountsCount()

    expect(count).toBeGreaterThan(0)
  })

  it('should get owner history', async () => {
    const history = await client.baiyujing.getOwnerHistory('initminer')

    expect(history).toBeDefined()
  })

  it('should get recovery request', async () => {
    const request = await client.baiyujing.getRecoveryRequest('initminer')

    expect(request).toBe(null)
  })

  it('should get withdraw routes', async () => {
    const routes = await client.baiyujing.getWithdrawRoutes('initminer', 'all')

    expect(routes).instanceOf(Array)
  })

  it('should get qi delegations', async () => {
    const delegations = await client.baiyujing.getQiDelegations('initminer', 10, 10)

    expect(delegations).toMatchInlineSnapshot(`[]`)
  })

  // TODO(@enpitsulin): 记录下报错
  it.skip('should get expiring qi delegations', async () => {
    try {
      const delegations = await client.baiyujing.getExpiringQiDelegations('ctaiyi-kxdbofbdnctaiyi-kxdbofbdn', 0, 10)
      expect(delegations).toMatchInlineSnapshot(`[]`)
    }
    catch (e) {
      expect(e).toBeInstanceOf(Error)
      expect((e as Error).cause).toMatchInlineSnapshot(`
        {
          "code": 13,
          "message": "Day of month value is out of range 1..31",
          "name": "N5boost10wrapexceptINS_9gregorian16bad_day_of_monthEEE",
          "stack": [
            {
              "context": {
                "file": "time.cpp",
                "hostname": "",
                "level": "warn",
                "line": 48,
                "method": "from_iso_string",
                "timestamp": "2025-02-05T09:53:14",
              },
              "data": {
                "what": "Day of month value is out of range 1..31",
              },
              "format": "\${what}: unable to convert ISO-formatted string to fc::time_point_sec",
            },
          ],
        }
      `)
    }
  })

  it('should get account history', async () => {
    const history = await client.baiyujing.getAccountHistory('initminer', 1, 1)

    expect(history).toBeInstanceOf(Array)
    expect(history.at(0)).toBeInstanceOf(Array)
    expect(history.at(0)).toHaveProperty('0', expect.any(Number))
    expect(history.at(0)).toHaveProperty('1', expect.objectContaining({
      op: expect.arrayContaining([
        expect.any(String),
        expect.any(Object),
      ]),
      block: expect.any(Number),
      op_in_trx: expect.any(Number),
      timestamp: expect.any(String),
      trx_id: expect.any(String),
      trx_in_block: expect.any(Number),
      virtual_op: expect.any(Number),
    }))
  })

  it('should get account resources', async () => {
    const resources = await client.baiyujing.getAccountResources(['initminer'])
    expect(resources).toHaveLength(1)
    expect(resources[0]).toHaveProperty('fabric')
    expect(resources[0]).toHaveProperty('food')
    expect(resources[0]).toHaveProperty('gold')
    expect(resources[0]).toHaveProperty('herb')
    expect(resources[0]).toHaveProperty('wood')
  })
})

describe('siming', () => {
  it('should get simings', async () => {
    const simings = await client.baiyujing.getSimings([0])

    expect(simings).toHaveLength(1)
    expect(simings[0]).toHaveProperty('id')
    expect(simings[0]).toHaveProperty('owner')
    expect(simings[0]).toHaveProperty('props')
    expect(simings[0]).toHaveProperty('running_version')
    expect(simings[0]).toHaveProperty('signing_key')
  })

  it('should get siming by account', async () => {
    const siming = await client.baiyujing.getSimingByAccount('initminer')

    expect(siming).toHaveProperty('id')
    expect(siming).toHaveProperty('owner')
  })

  it('should get siming by adore', async () => {
    const simings = await client.baiyujing.getSimingsByAdore('initminer', 10)

    expect(simings).toBeInstanceOf(Array)
    expect(simings).toHaveLength(1)

    expect(simings.at(0)).toHaveProperty('id')
    expect(simings.at(0)).toHaveProperty('owner')
  })

  it('should lookup siming accounts', async () => {
    const simings = await client.baiyujing.lookupSimingAccounts('initminer', 10)

    expect(simings).toBeInstanceOf(Array)
    expect(simings).toContain('initminer')
  })

  it('should get siming count', async () => {
    const count = await client.baiyujing.getSimingCount()

    expect(count).toBeGreaterThan(0)
    expect(count).toBeLessThanOrEqual(21)
  })
})

describe('transaction', () => {
  let trx: Transaction | null = null
  let signedTrx: SignedTransaction | null = null
  let transactionId: string | null = null

  beforeAll(async () => {
    trx = await client.broadcast.prepareTransaction({
      operations: [
        [
          'transfer_to_qi',
          {
            amount: '0.010 YANG',
            from: 'initminer',
            to: 'initminer',
          },
        ],
      ],
    })

    signedTrx = client.broadcast.sign(trx, INITMINER_PRIVATE_KEY)
    const confirmation = await client.broadcast.send(signedTrx)
    transactionId = confirmation.id
  })

  it('should get transaction results', async () => {
    expect(transactionId, 'this test case should run after the previous test case').not.toBeNull()
    const results = await client.baiyujing.getTransactionResults(transactionId!)
    expect(results).toHaveLength(1)
  })

  it('should get transaction hex', async () => {
    expect(signedTrx, 'this test case should run after the previous test case').not.toBeNull()
    const hex = await client.baiyujing.getTransactionHex(signedTrx!)
    expect(hex).toEqual(expect.any(String))
  })

  it('should get transaction', async () => {
    expect(transactionId, 'this test case should run after the previous test case').not.toBeNull()
    const transaction = await client.baiyujing.getTransaction(transactionId!)
    expect(transaction).toMatchObject(transaction)
  })

  it('should get require signatures', async () => {
    expect(signedTrx, 'this test case should run after the previous test case').not.toBeNull()
    const signatures = await client.baiyujing.getRequiredSignatures(
      signedTrx!,
      [],
    )
    expect(signatures).toMatchInlineSnapshot(`[]`)
  })

  it('should get potential signatures', async () => {
    expect(signedTrx, 'this test case should run after the previous test case').not.toBeNull()
    const signatures = await client.baiyujing.getPotentialSignatures(signedTrx!)
    expect(signatures).toEqual([INITMINER_PRIVATE_KEY.createPublic().toString()])
  })

  it('should verify authority', async () => {
    expect(signedTrx, 'this test case should run after the previous test case').not.toBeNull()
    const authority = await client.baiyujing.verifyAuthority(signedTrx!)
    expect(authority).toBe(true)
  })

  it('should verify account authority', async () => {
    const authority = await client.baiyujing.verifyAccountAuthority('temp', [INITMINER_PRIVATE_KEY.createPublic().toString()])
    expect(authority).toBe(true)
  })
})

describe('nfa', () => {
  it('should get nfa', async () => {
    const nfa = await client.baiyujing.findNfa(0)
    expect(nfa).toHaveProperty('id')
    expect(nfa).toHaveProperty('symbol')
    expect(nfa.symbol).toBe('nfa.test')
  })

  it('should list all nfas', async () => {
    const nfas = await client.baiyujing.listNfas('initminer', 10)
    expect(nfas).instanceOf(Array)
    expect(nfas.length).greaterThan(0)
  })

  it('should get nfa history', async () => {
    const history = await client.baiyujing.getNfaHistory(0, 20, 10)
    expect(history).instanceOf(Array)
  })

  it('nfa action', async () => {
    const info = await client.baiyujing.getNfaActionInfo(0, 'welcome')
    expect(info).toHaveProperty('exist', true)
    expect(info).toHaveProperty('consequence', false)
  })

  it('nfa eval action', async () => {
    const result = await client.baiyujing.evalNfaAction(0, 'welcome', [])

    expect(result).toHaveProperty('eval_result', [{ type: 'lua_string', value: { v: 'hello nfa' } }])
    expect(result).toHaveProperty('narrate_logs', [])
    expect(result).toHaveProperty('err', '')
  })

  it('nfa action with string args', async () => {
    // reference: https://github.com/hongzhongx/taiyi-contracts/blob/main/nfas/book/book.lua
    const res = await client.baiyujing.evalNfaActionWithStringArgs(0, 'welcome', '[]')
    expect(res).toHaveProperty('narrate_logs')
  })
})

// 本地测试网角色和区域合约尚未部署
describe.skip('actor and zone contract does implement', () => {
  describe('actor', () => {
    it('should find actor', async () => {
      const actor = await client.baiyujing.findActor('李火旺')
      expect(actor).toHaveProperty('name', '李火旺')
    })

    it('should find actors', async () => {
      const actors = await client.baiyujing.findActors([1, 2])
      expect(actors).toHaveLength(2)
    })

    it('should list actors', async () => {
      const actors = await client.baiyujing.listActors('initminer', 10)
      expect(actors).toHaveLength(0)
    })

    it('should get actor history', async () => {
      const history = await client.baiyujing.getActorHistory('李火旺', 10, 10)
      expect(history).toBeDefined()
    })

    it('should list actors below health', async () => {
      const actors = await client.baiyujing.listActorsBelowHealth(0, 1)
      expect(actors).toBeDefined()
      expect(actors).instanceOf(Array)
    })

    it('should get actor talent rules', async () => {
      const rules = await client.baiyujing.findActorTalentRules([0, 1])
      expect(rules).toBeInstanceOf(Array)
      expect(rules).toHaveLength(2)
    })

    it('should list actors on zone', async () => {
      const actors = await client.baiyujing.listActorsOnZone(0, 10)
      expect(actors).toMatchInlineSnapshot(`[]`)
    })
  })

  describe('tiandao', () => {
    it('should get tiandao properties', async () => {
      const properties = await client.baiyujing.getTiandaoProperties()
      expect(properties).toBeDefined()
      expect(properties).toHaveProperty('id')
      expect(properties).toHaveProperty('v_years')
      expect(properties).toHaveProperty('v_months')
      expect(properties).toHaveProperty('v_times')
    })

    it('should find zones', async () => {
      const zones = await client.baiyujing.findZones([1, 2])
      expect(zones).toHaveLength(2)
    })

    it('should find zones by name', async () => {
      const zones = await client.baiyujing.findZonesByName(['牛心村'])
      expect(zones).toHaveLength(1)
      expect(zones[0].id).toBe(4)
    })

    it('should list zones', async () => {
      const zones = await client.baiyujing.listZones('initminer', 10)
      expect(zones).instanceOf(Array)
      expect(zones.length).toBeGreaterThanOrEqual(0)
    })

    it('should list zones by type', async () => {
      const zones = await client.baiyujing.listZonesByType('XUKONG', 10)
      expect(zones).instanceOf(Array)
      expect(zones.length).toBeGreaterThanOrEqual(0)
    })

    it('should list to zones by from', async () => {
      const zones = await client.baiyujing.listToZonesByFrom('牛心村', 10)

      expect(zones).instanceOf(Array)
      expect(zones.length).toBeGreaterThanOrEqual(0)
    })

    it('should list from zones by to', async () => {
      const zones = await client.baiyujing.listFromZonesByTo('牛心村', 10)

      expect(zones).instanceOf(Array)
      expect(zones.length).toBeGreaterThanOrEqual(0)
    })

    it('should find way to zone', async () => {
      const zones = await client.baiyujing.findWayToZone('牛心村', '大梁')

      expect(zones).toBeDefined()
      expect(zones.way_points).toBeDefined()
      expect(zones.way_points).instanceOf(Array)
    })

    it('should get contract source code', async () => {
      const code = await client.baiyujing.getContractSourceCode('contract.nfa.base')
      await expect(code).toMatchFileSnapshot('./__snapshots__/get_contract_source_code.snap')
    })
  })
})
