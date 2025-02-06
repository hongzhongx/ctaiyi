import type { Client } from '../client'
import { iteratorStream, sleep } from '../utils'

export enum BlockchainMode {
  /**
   * 仅获取不可逆区块。
   */
  Irreversible,
  /**
   * 获取所有区块。
   */
  Latest,
}

export interface BlockchainStreamOptions {
  /**
   * 开始块高，包含。如果未指定，生成将从当前块高开始。
   */
  from?: number
  /**
   * 结束块高，包含。如果未指定，流将继续无限期地进行。
   */
  to?: number
  /**
   * 流模式，如果设置为 `Latest` 可能会包含未最终应用到链中的区块。
   * 默认值为 `Irreversible`。
   */
  mode?: BlockchainMode
}

export class Blockchain {
  constructor(readonly client: Client) { }

  /**
   * 获取当前块高
   */
  public async getCurrentBlockNum(mode = BlockchainMode.Irreversible) {
    const props = await this.client.baiyujing.getDynamicGlobalProperties()
    switch (mode) {
      case BlockchainMode.Irreversible:
        return props.last_irreversible_block_num
      case BlockchainMode.Latest:
        return props.head_block_number
    }
  }

  /**
   * 获取最新区块头
   */
  public async getCurrentBlockHeader(mode?: BlockchainMode) {
    return this.client.baiyujing.getBlockHeader(await this.getCurrentBlockNum(mode))
  }

  /**
   * 获取最新区块
   */
  public async getCurrentBlock(mode?: BlockchainMode) {
    return this.client.baiyujing.getBlock(await this.getCurrentBlockNum(mode))
  }

  /**
   * 返回一个异步块高迭代器。
   * @param options 迭代器选项，也可以是一个区块编号。
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
   * 返回一个块高流，接受与 {@link getBlockNumbers} 相同的参数。
   */
  public getBlockNumberStream(options?: BlockchainStreamOptions | number) {
    return iteratorStream(this.getBlockNumbers(options))
  }

  /**
   * 返回一个异步块迭代器，接受与 {@link getBlockNumbers} 相同的参数。
   */
  public async *getBlocks(options?: BlockchainStreamOptions | number) {
    for await (const num of this.getBlockNumbers(options)) {
      yield await this.client.baiyujing.getBlock(num)
    }
  }

  /**
   * 返回一个区块流，接受与 {@link getBlockNumbers} 相同的参数。
   */
  public getBlockStream(options?: BlockchainStreamOptions | number) {
    return iteratorStream(this.getBlocks(options))
  }

  /**
   * 返回一个异步 Operation 迭代器，接受与 {@link getBlockNumbers} 相同的参数。
   */
  public async *getOperations(options?: BlockchainStreamOptions | number) {
    for await (const num of this.getBlockNumbers(options)) {
      const operations = await this.client.baiyujing.getOperations(num)
      for (const operation of operations) {
        yield operation
      }
    }
  }

  /**
   * 返回一个 Operation 流，接受与 {@link getBlockNumbers} 相同的参数。
   */
  public getOperationsStream(options?: BlockchainStreamOptions | number) {
    return iteratorStream(this.getOperations(options))
  }
}
