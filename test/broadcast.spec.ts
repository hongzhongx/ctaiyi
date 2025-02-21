import type { Operation } from '../src'
import { PrivateKey } from '../src'
import { WebSocketTransport } from '../src/transport'
import { getTestnetAccounts, INITMINER_PRIVATE_KEY, randomString } from './common'
import { runForBothTransports } from './fixture'

vi.setConfig({
  testTimeout: 60 * 1000,

  hookTimeout: 60 * 1000,
})

runForBothTransports('broadcast for transport $transport.type', async (client) => {
  if (client.transport instanceof WebSocketTransport) {
    await (<WebSocketTransport>client.transport).connect()
  }
  const [acc1, acc2] = await getTestnetAccounts(client)

  describe('broadcast helper', () => {
    it('should create or exist account', async () => {
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

      // @ts-expect-error: check something else throw TypeError: client.broadcast.someThingElse is not a function
      expect(() => client.broadcast.someThingElse())
        .throws(TypeError, 'client.broadcast.someThingElse is not a function')
    })
  })

  describe('sign transaction', () => {
    it('should sign transaction with signature', async () => {
      const activeKey = PrivateKey.fromLogin(acc1.username, acc1.password)
      const operations: Operation[] = [
        [
          'create_actor',
          {
            fee: '1.000000 QI',
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

    it('should broadcast transaction', async () => {
      const trx = await client.broadcast.transfer({
        from: 'initminer',
        to: 'initminer',
        amount: '0.001 YANG',
        memo: '',
      }, INITMINER_PRIVATE_KEY)

      expect(trx).toHaveProperty('id')
      expect(trx).toHaveProperty('block_num')
      expect(trx).toHaveProperty('trx_num')
      expect(trx).toHaveProperty('expired')
    })
  })
})
