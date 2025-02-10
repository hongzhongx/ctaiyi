import type { Operation } from '../src'
import { Client, PrivateKey } from '../src'
import { getTestnetAccounts, randomString } from './common'

describe('broadcast', () => {
  vi.setConfig({
    testTimeout: 60 * 1000,
  })

  const client = Client.testnet()

  type Account = Awaited<ReturnType<typeof getTestnetAccounts>>[number]
  let acc1: Account, acc2: Account

  beforeAll(async () => {
    [acc1, acc2] = await getTestnetAccounts()
  })

  it.skip('should create or exist account', async () => {
    expect(acc1).toBeDefined()
    expect(acc2).toBeDefined()
  })

  it('should get valid prepare tx', async () => {
    const operations: Operation[] = []
    const preparedTx = await client.broadcast.prepareTransaction({ operations })
    expect(preparedTx).toHaveProperty('expiration', expect.any(String))
    expect(preparedTx).toHaveProperty('extensions', [])
    expect(preparedTx).toHaveProperty('ref_block_num', expect.any(Number))
    expect(preparedTx).toHaveProperty('ref_block_prefix', expect.any(Number))
  })

  it.skip('should sign tx with signature', async () => {
    const activeKey = PrivateKey.fromLogin(acc1.username, acc1.password)
    const operations: Operation[] = [
      [
        'create_actor',
        {
          // both work
          // fee: '1 @@000000037',
          // fee: '1.000000 QI',
          fee: {
            amount: 1,
            precision: 6,
            fai: '@@000000037',
          },
          creator: 'sifu',
          family_name: `ctaiyi-${randomString(2)}`,
          last_name: `ctaiyi-${randomString(2)}`,
        },
      ],
    ]
    const preparedTx = await client.broadcast.prepareTransaction({ operations })
    const tx = client.broadcast.sign(preparedTx, activeKey)

    expect(tx).toHaveProperty('expiration', preparedTx.expiration)
    expect(tx).toHaveProperty('extensions', preparedTx.extensions)
    expect(tx).toHaveProperty('ref_block_num', preparedTx.ref_block_num)
    expect(tx).toHaveProperty('ref_block_prefix', preparedTx.ref_block_prefix)
    expect(tx).toHaveProperty('operations', operations)
    expect(tx).toHaveProperty('signatures', [expect.any(String)])
  })

  it('should exist all necessary operations', async () => {
    const broadcast = client.broadcast

    function check(name: string) {
      expect(Reflect.get(broadcast, name)).toBeDefined()
    }

    check('createAccount')
    check('updateAccount')

    check('transfer')
    check('transferToQi')
    check('withdrawQi')
    check('setWithdrawQiRoute')
    check('delegateQi')

    check('simingUpdate')
    check('simingSetProperties')
    check('accountSimingAdore')
    check('accountSimingProxy')
    check('declineAdoringRights')

    check('custom')
    check('customJson')

    check('requestAccountRecovery')
    check('recoverAccount')
    check('changeRecoveryAccount')

    check('claimRewardBalance')

    check('createContract')
    check('reviseContract')
    check('callContractFunction')

    check('createNfaSymbol')
    check('createNfa')
    check('transferNfa')
    check('approveNfaActive')
    check('actionNfa')

    check('createZone')

    check('createActorTalentRule')
    check('createActor')

    check('hardfork')
    check('fillQiWithdraw')
    check('returnQiDelegation')
    check('producerReward')

    check('nfaConvertResources')
    check('nfaTransfer')
    check('nfaDepositWithdraw')
    check('rewardFeigang')
    check('rewardCultivation')

    check('tiandaoYearChange')
    check('tiandaoMonthChange')
    check('tiandaoTimeChange')

    check('actorBorn')
    check('actorTalentTrigger')
    check('actorMovement')
    check('actorGrown')

    check('narrateLog')
  })
})
