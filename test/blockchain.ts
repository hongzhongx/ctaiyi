import type { AppliedOperation, SignedBlock } from './../src'
import * as assert from 'assert'
import { BlockchainMode, Client } from './../src'

import { agent, TEST_NODE } from './common'

import 'mocha'

describe('blockchain', function () {
  this.slow(5 * 1000)
  this.timeout(60 * 1000)

  const client = new Client(TEST_NODE, { agent })

  const expectedIds = ['00000001e5317d927966320190e74cf5506d372a', '000000027657671fc0c4b840cb367d5d45eaff1a']
  const expectedOps = [
    'producer_reward',
    'account_create',
    'account_create',
    'transfer',
    'transfer',
    'transfer_to_qi',
    'transfer_to_qi',
    'tiandao_time_change',
  ]

  it('should yield blocks', async () => {
    const ids: string[] = []
    for await (const block of client.blockchain.getBlocks({ from: 1, to: 2 })) {
      ids.push(block.block_id)
    }
    assert.deepEqual(ids, expectedIds)
  })

  it('should stream blocks', async () => {
    await new Promise((resolve, reject) => {
      const stream = client.blockchain.getBlockStream({ from: 1, to: 2 })
      const ids: string[] = []
      stream.on('data', (block: SignedBlock) => {
        ids.push(block.block_id)
      })
      stream.on('error', reject)
      stream.on('end', () => {
        assert.deepEqual(ids, expectedIds)
        resolve()
      })
    })
  })

  it('should yield operations', async () => {
    const ops: string[] = []
    for await (const operation of client.blockchain.getOperations({ from: 1, to: 100 })) {
      ops.push(operation.op[0])
    }
    assert.deepEqual(ops, expectedOps)
  })

  it('should stream operations', async () => {
    await new Promise((resolve, reject) => {
      const stream = client.blockchain.getOperationsStream({ from: 1, to: 100 })
      const ops: string[] = []
      stream.on('data', (operation: AppliedOperation) => {
        ops.push(operation.op[0])
      })
      stream.on('error', reject)
      stream.on('end', () => {
        assert.deepEqual(ops, expectedOps)
        resolve()
      })
    })
  })

  it('should yield latest blocks', async () => {
    const latest = await client.blockchain.getCurrentBlock(BlockchainMode.Latest)
    for await (const block of client.blockchain.getBlocks({ mode: BlockchainMode.Latest })) {
      if (block.block_id === latest.block_id) {
        continue
      }
      assert.equal(block.previous, latest.block_id, 'should have the same block id')
      break
    }
  })

  it('should handle errors on stream', async () => {
    await new Promise((resolve, reject) => {
      const stream = client.blockchain.getBlockStream(Number.MAX_VALUE)
      stream.on('data', () => {
        assert(false, 'unexpected stream data')
      })
      stream.on('error', (error) => {
        resolve()
      })
    })
  })

  it('should get block number stream', async () => {
    const current = await client.blockchain.getCurrentBlockNum()
    await new Promise(async (resolve, reject) => {
      const stream = client.blockchain.getBlockNumberStream()
      stream.on('data', (num) => {
        assert(num >= current)
        resolve()
      })
      stream.on('error', reject)
    })
  })

  it('should get current block header', async () => {
    const now = Date.now()
    const header = await client.blockchain.getCurrentBlockHeader()
    const ts = new Date(`${header.timestamp}Z`).getTime()
    assert(Math.abs((ts / 1000) - (now / 1000)) < 120, 'blockheader timestamp too old')
  })
})
