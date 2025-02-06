import type { Client } from './../client'
import { iteratorStream, sleep } from './../utils'

export enum BlockchainMode {
  /**
   * Only get irreversible blocks.
   */
  Irreversible,
  /**
   * Get all blocks.
   */
  Latest,
}

export interface BlockchainStreamOptions {
  /**
   * Start block number, inclusive. If omitted generation will start from current block height.
   */
  from?: number
  /**
   * End block number, inclusive. If omitted stream will continue indefinitely.
   */
  to?: number
  /**
   * Streaming mode, if set to `Latest` may include blocks that are not applied to the final chain.
   * Defaults to `Irreversible`.
   */
  mode?: BlockchainMode
}

export class Blockchain {
  constructor(readonly client: Client) {}

  /**
   * Get latest block number.
   */
  public async getCurrentBlockNum(mode = BlockchainMode.Irreversible) {
    const props = await this.client.database.getDynamicGlobalProperties()
    switch (mode) {
      case BlockchainMode.Irreversible:
        return props.last_irreversible_block_num
      case BlockchainMode.Latest:
        return props.head_block_number
    }
  }

  /**
   * Get latest block header.
   */
  public async getCurrentBlockHeader(mode?: BlockchainMode) {
    return this.client.database.getBlockHeader(await this.getCurrentBlockNum(mode))
  }

  /**
   * Get latest block.
   */
  public async getCurrentBlock(mode?: BlockchainMode) {
    return this.client.database.getBlock(await this.getCurrentBlockNum(mode))
  }

  /**
   * Return a asynchronous block number iterator.
   * @param options Feed options, can also be a block number to start from.
   */
  public async *getBlockNumbers(options?: BlockchainStreamOptions | number) {
    // const config = await this.client.database.getConfig()
    // const interval = config['TAIYI_BLOCK_INTERVAL'] as number
    const interval = 3
    if (!options) {
      options = {}
    }
    else if (typeof options === 'number') {
      options = { from: options }
    }
    let current = await this.getCurrentBlockNum(options.mode)
    if (options.from !== undefined && options.from > current) {
      throw new Error(`From can't be larger than current block num (${current})`)
    }
    let seen = options.from !== undefined ? options.from : current
    while (true) {
      while (current > seen) {
        yield seen++
        if (options.to !== undefined && seen > options.to) {
          return
        }
      }
      await sleep(interval * 1000)
      current = await this.getCurrentBlockNum(options.mode)
    }
  }

  /**
   * Return a stream of block numbers, accepts same parameters as {@link getBlockNumbers}.
   */
  public getBlockNumberStream(options?: BlockchainStreamOptions | number) {
    return iteratorStream(this.getBlockNumbers(options))
  }

  /**
   * Return a asynchronous block iterator, accepts same parameters as {@link getBlockNumbers}.
   */
  public async *getBlocks(options?: BlockchainStreamOptions | number) {
    for await (const num of this.getBlockNumbers(options)) {
      yield await this.client.database.getBlock(num)
    }
  }

  /**
   * Return a stream of blocks, accepts same parameters as {@link getBlockNumbers}.
   */
  public getBlockStream(options?: BlockchainStreamOptions | number) {
    return iteratorStream(this.getBlocks(options))
  }

  /**
   * Return a asynchronous operation iterator, accepts same parameters as {@link getBlockNumbers}.
   */
  public async *getOperations(options?: BlockchainStreamOptions | number) {
    for await (const num of this.getBlockNumbers(options)) {
      const operations = await this.client.database.getOperations(num)
      for (const operation of operations) {
        yield operation
      }
    }
  }

  /**
   * Return a stream of operations, accepts same parameters as {@link getBlockNumbers}.
   */
  public getOperationsStream(options?: BlockchainStreamOptions | number) {
    return iteratorStream(this.getOperations(options))
  }
}
