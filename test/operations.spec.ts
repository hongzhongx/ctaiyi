import type { ChangeRecoveryAccountOperation, CustomOperation } from './../src'
import { randomBytes } from 'crypto'
import { bytesToHex } from '@noble/hashes/utils'

import { Asset, Client, HexBuffer, PrivateKey } from './../src'
import { getTestnetAccounts, randomString } from './common'

// 需要本地节点来处理
describe.skip('operations', () => {
  vi.setConfig({
    testTimeout: 10 * 60 * 1000,
    hookTimeout: 10 * 60 * 1000,
  })

  const client = Client.testnet()

  type Account = Awaited<ReturnType<typeof getTestnetAccounts>>[number]
  let acc1: Account, acc2: Account
  let acc1Key: PrivateKey

  beforeAll(async () => {
    [acc1, acc2] = await getTestnetAccounts()
    acc1Key = PrivateKey.fromLogin(acc1.username, acc1.password, 'active')
  })

  it('should delegate qi', async () => {
    const [user1] = await client.baiyujing.getAccounts([acc1.username])
    const currentDelegation = Asset.from(user1.received_qi)
    const newDelegation = Asset.from(
      currentDelegation.amount >= 1000 ? 0 : 1000 + Math.random() * 1000,
      'QI',
    )
    await client.broadcast.delegateQi(
      {
        delegator: acc1.username,
        delegatee: acc2.username,
        qi: newDelegation,
      },
      acc1Key
    )
    const [user2] = await client.baiyujing.getAccounts([acc2.username])
    assert.equal(user2.received_qi, newDelegation.toString())
  })

  it('should send custom', async () => {
    const op: CustomOperation = [
      'custom', {
        required_auths: [acc1.username],
        id: ~~(Math.random() * 65535),
        data: new Uint8Array(randomBytes(512).buffer),
      }
    ]
    const rv = await client.broadcast.sendOperations([op], acc1Key)
    const tx = await client.baiyujing.getTransaction(rv.id)
    const rop = tx.operations[0]
    assert.equal(rop[0], 'custom')
    assert.equal(rop[1].data, HexBuffer.from(op[1].data).toString())
  })

  it('should send custom json', async () => {
    const data = { test: 123, string: 'unicode🐳' }
    const rv = await client.broadcast.json({
      required_auths: [acc1.username],
      required_posting_auths: [],
      id: 'something',
      json: JSON.stringify(data),
    }, acc1Key)
    const tx = await client.baiyujing.getTransaction(rv.id)
    assert.deepEqual(JSON.parse(tx.operations[0][1].json), data)
  })

  it('should transfer yang', async () => {
    const [acc2bf] = await client.baiyujing.getAccounts([acc2.username])
    await client.broadcast.transfer({
      from: acc1.username,
      to: acc2.username,
      amount: '0.001 YANG',
      memo: 'Hej på dig!',
    }, acc1Key)
    const [acc2af] = await client.baiyujing.getAccounts([acc2.username])
    const old_bal = Asset.from(acc2bf.balance)
    const new_bal = Asset.from(acc2af.balance)
    assert.equal(new_bal.subtract(old_bal).toString(), '0.001 YANG')
  })

  it('should create account', async () => {
    // ensure not testing accounts on mainnet
    assert(bytesToHex(client.chainId) !== '0000000000000000000000000000000000000000000000000000000000000000')

    const username = `ds-${randomString(12)}`
    const password = randomString(32)
    await client.broadcast.createTestAccount({
      username,
      password,
      creator: acc1.username,
      metadata: { date: new Date() },
    }, acc1Key)

    const [newAcc] = await client.baiyujing.getAccounts([username])
    assert.equal(newAcc.name, username)
    // not sure why but on the testnet the recovery account is always 'sifu'
    // assert.equal(newAcc.recovery_account, acc1.username)
    const postingWif = PrivateKey.fromLogin(username, password, 'posting')
    const postingPub = postingWif.createPublic(client.addressPrefix).toString()
    const memoWif = PrivateKey.fromLogin(username, password, 'memo')
    const memoPub = memoWif.createPublic(client.addressPrefix).toString()
    assert.equal(newAcc.memo_key, memoPub)
    assert.equal(newAcc.posting.key_auths[0][0], postingPub)
  })

  it('should update account', async () => {
    const key = PrivateKey.fromLogin(acc1.username, acc1.password, 'active')
    const foo = Math.random()
    await client.broadcast.updateAccount({
      account: acc1.username,
      memo_key: PrivateKey.fromLogin(acc1.username, acc1.password, 'memo').createPublic(client.addressPrefix),
      json_metadata: JSON.stringify({ foo }),
    }, key)
    const [acc] = await client.baiyujing.getAccounts([acc1.username])
    assert.deepEqual({ foo }, JSON.parse(acc.json_metadata))
  })

  it('should create account custom auths', async () => {
    const key = PrivateKey.fromLogin(acc1.username, acc1.password, 'active')

    const username = `ds-${randomString(12)}`
    const password = randomString(32)
    const metadata = { my_password_is: password }

    const ownerKey = PrivateKey.fromLogin(username, password, 'owner').createPublic(client.addressPrefix)
    const activeKey = PrivateKey.fromLogin(username, password, 'active').createPublic(client.addressPrefix)
    const postingKey = PrivateKey.fromLogin(username, password, 'posting').createPublic(client.addressPrefix)
    const memoKey = PrivateKey.fromLogin(username, password, 'memo').createPublic(client.addressPrefix)
    await client.broadcast.createTestAccount({
      creator: acc1.username,
      username,
      auths: {
        owner: ownerKey,
        active: activeKey.toString(),
        posting: { weight_threshold: 1, account_auths: [], key_auths: [[postingKey, 1]] },
        memoKey,
      },
      metadata,
    }, key)
    const [newAccount] = await client.baiyujing.getAccounts([username])
    assert.equal(newAccount.name, username)
    assert.equal(newAccount.memo_key, memoKey.toString())
  })

  it('should create account and calculate fees', async () => {
    const password = randomString(32)
    const metadata = { my_password_is: password }
    const creator = acc1.username

    // ensure not testing accounts on mainnet
    assert(bytesToHex(client.chainId) !== '0000000000000000000000000000000000000000000000000000000000000000')

    const chainProps = await client.baiyujing.getChainProperties()
    const creationFee = Asset.from(chainProps.account_creation_fee)

    // no delegation and no fee (uses RC instead)
    await client.broadcast.createTestAccount({
      password,
      metadata,
      creator,
      username: `foo${randomString(12)}`,
    }, acc1Key)

    // fee (no RC used) and no delegation
    await client.broadcast.createTestAccount({
      password,
      metadata,
      creator,
      username: `foo${randomString(12)}`,
      fee: creationFee,
    }, acc1Key)

    // fee plus delegation
    await client.broadcast.createTestAccount({
      password,
      creator,
      username: `foo${randomString(12)}`,
      fee: creationFee,
    }, acc1Key)

    // invalid (inexact) fee must fail
    try {
      await client.broadcast.createTestAccount({ password, metadata, creator, username: 'foo', fee: '1.111 YANG' }, acc1Key)
      assert(false, 'should not be reached')
    }
    catch (error) {
      assert(error instanceof Error)
      assert.equal(error.message, `Fee must be exactly ${creationFee.toString()}`)
    }

    try {
      await client.broadcast.createTestAccount({ metadata, creator, username: 'foo' }, acc1Key)
      assert(false, 'should not be reached')
    }
    catch (error) {
      assert(error instanceof Error)
      assert.equal(error.message, 'Must specify either password or auths')
    }
  })

  it('should change recovery account', async () => {
    const op: ChangeRecoveryAccountOperation = ['change_recovery_account', {
      account_to_recover: acc1.username,
      new_recovery_account: acc2.username,
      extensions: [],
    }]
    const key = PrivateKey.fromLogin(acc1.username, acc1.password, 'active')
    await client.broadcast.sendOperations([op], key)
  })
})
