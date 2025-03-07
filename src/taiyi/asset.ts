import invariant from 'tiny-invariant'

/**
 * 资产 symbol
 */
export type AssetSymbol = 'YANG' | 'YIN' | 'QI' | 'GOLD' | 'FOOD' | 'WOOD' | 'FABR' | 'HERB'

export interface MaterialAssets {
  gold: Asset | string
  food: Asset | string
  wood: Asset | string
  fabric: Asset | string
  herb: Asset | string
}

export interface FaiAssetObject {
  amount: bigint
  precision: number
  fai: `@@${string}`
}

/**
 * 表示太乙资产的类，例如 `1.000 QI` 或 `12.112233 YANG`。
 */
export class Asset {
  public static from(object: FaiAssetObject): Asset
  public static from(amount: string): Asset
  public static from(amount: number, symbol: AssetSymbol): Asset
  public static from(amount: bigint, precision: number, fai: `@@${string}`): Asset
  public static from(
    args1: number | string | bigint | FaiAssetObject,
    args2?: number | AssetSymbol,
    args3?: `@@${string}`,
  ) {
    // overload 2 from legacy asset string
    if (typeof args1 === 'string' && !args2) {
      invariant(args1.match(/^\d+\.\d+ [A-Z]+$/), 'Invalid asset string')
      const [amount, symbol] = args1.split(' ')
      invariant(Asset.isValidSymbol(symbol), `Invalid asset symbol: ${symbol}`)
      const precision = Asset.getPrecision(symbol)
      const fai = Asset.getIdentifier(symbol)
      const amountBigInt = BigInt(Number(amount) * (10 ** precision))
      return new Asset(amountBigInt.toString(), precision, fai)
    }
    // overload 3 from number and symbol
    else if (typeof args1 === 'number' || typeof args1 === 'string') {
      const precision = Asset.getPrecision(args2 as AssetSymbol)
      const amount = BigInt(Number(args1) * (10 ** precision))
      invariant(Asset.isValidSymbol(args2), `Invalid asset symbol: ${args2}`)
      const fai = Asset.getIdentifier(args2 as AssetSymbol)
      return new Asset(amount.toString(), precision, fai)
    }
    // overload 1 from fai asset object
    else if (typeof args1 === 'object') {
      invariant(args1.amount, 'amount must be provided')
      invariant(args1.precision, 'precision must be provided')
      invariant(args1.fai, 'fai must be provided')
      return new Asset(args1.amount.toString(), args1.precision, args1.fai)
    }
    // overload 4 from bigint, precision and fai
    invariant(typeof args1 === 'bigint', 'amount must be a bigint')
    invariant(typeof args2 === 'number', 'precision must be a number')
    invariant(args3, 'fai must be provided when using bigint amount')
    return new Asset(args1.toString(), args2, args3)
  }

  constructor(
    public amount: string,
    public precision: number,
    public fai: `@@${string}`,
  ) {

  }

  public static isValidSymbol(symbol: any): symbol is AssetSymbol {
    if (typeof symbol !== 'string') {
      return false
    }
    return ['YANG', 'YIN', 'QI', 'GOLD', 'FOOD', 'WOOD', 'FABR', 'HERB'].includes(symbol)
  }

  /**
   * 返回资产的精度。
   */
  public static getPrecision(symbol: AssetSymbol): number {
    switch (symbol) {
      case 'YANG':
      case 'YIN':
        return 3
      case 'QI':
      case 'GOLD':
      case 'FOOD':
      case 'WOOD':
      case 'FABR':
      case 'HERB':
        return 6
    }
  }

  /**
   * 返回资产的 identifier
   */
  static getIdentifier(symbol: AssetSymbol): `@@${string}` {
    invariant(Asset.isValidSymbol(symbol), `Invalid asset symbol: ${symbol}`)
    switch (symbol) {
      case 'YIN':
        return '@@000000013'
      case 'YANG':
        return '@@000000021'
      case 'QI':
        return '@@000000037'
      case 'GOLD':
        return '@@000000045'
      case 'FOOD':
        return '@@000000059'
      case 'WOOD':
        return '@@000000068'
      case 'FABR':
        return '@@000000076'
      case 'HERB':
        return '@@000000084'
      default:
        throw new Error(`Not implemented symbol: ${symbol}`)
    }
  }

  toJSON() {
    if (this.fai.startsWith('@@')) {
      return {
        amount: this.amount.toString(),
        precision: this.precision,
        fai: this.fai,
      }
    }
    else {
      return this.fai
    }
  }
}

export type PriceType = Price | { base: Asset | string, quote: Asset | string }

/**
 * 表示一个资产相对于另一个资产的相对价值报价。
 * 类似于用于确定货币价值的"货币对"。
 *
 * 例如：
 * 1 EUR / 1.25 USD，其中：
 * 1 EUR 是作为基准(base)的资产
 * 1.25 USD 是作为报价(quote)的资产
 *
 * 可以用来确定 EUR 对 USD 的价值。
 */
export class Price {
  /**
   * 创建新的 Price。
   */
  public static from(value: PriceType) {
    if (value instanceof Price) {
      return value
    }
    else {
      const base = typeof value.base === 'string' ? Asset.from(value.base) : value.base
      const quote = typeof value.quote === 'string' ? Asset.from(value.quote) : value.quote
      return new Price(base, quote)
    }
  }

  /**
   * @param base  - 表示价格对象的值相对于报价资产的值。不能有 amount == 0，否则断言失败。
   * @param quote - 表示相对资产。不能有 amount == 0，否则断言失败。
   *
   * base 和 quote 必须具有不同的 symbol 定义。
   */
  constructor(public readonly base: Asset, public readonly quote: Asset) {
    const baseAmount = BigInt(base.amount)
    const quoteAmount = BigInt(quote.amount)
    invariant(baseAmount !== 0n && quoteAmount !== 0n, 'base and quote assets must be non-zero')
    invariant(base.fai !== quote.fai, 'base and quote can not have the same fai')
  }

  /**
   * 返回这个价格对的字符串表示。
   */
  public toString() {
    return `${this.base}:${this.quote}`
  }

  /**
   * 返回一个新实例为价格在两个符号之间转换。
   * 如果传递的资产符号不是 base 或 quote，则抛出错误。
   */
  public convert(asset: Asset) {
    const assetAmount = BigInt(asset.amount)
    const baseAmount = BigInt(this.base.amount)
    const quoteAmount = BigInt(this.quote.amount)

    if (asset.fai === this.base.fai) {
      invariant(baseAmount > 0n)
      return Asset.from(
        (assetAmount * quoteAmount) / baseAmount,
        this.quote.precision,
        this.quote.fai,
      )
    }
    else if (asset.fai === this.quote.fai) {
      invariant(quoteAmount > 0n)
      return Asset.from(
        (assetAmount * baseAmount) / quoteAmount,
        this.base.precision,
        this.base.fai,
      )
    }
    else {
      throw new Error(`Can not convert ${asset} with ${this}`)
    }
  }
}
