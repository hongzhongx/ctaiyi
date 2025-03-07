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
  public static from(asset: Asset): Asset
  public static from(object: FaiAssetObject): Asset
  public static from(amount: `${string} ${AssetSymbol}`): Asset
  public static from(amount: number | string, symbol?: AssetSymbol): Asset
  public static from(amount: bigint, precision: number, fai: `@@${string}`): Asset
  public static from(
    args1: number | string | bigint | FaiAssetObject | Asset,
    args2?: number | AssetSymbol,
    args3?: `@@${string}`,
  ) {
    if (args1 instanceof Asset) {
      return args1
    }
    // overload 3 from legacy asset string
    if (typeof args1 === 'string' && args1.match(/^\d+\.\d+ [A-Z]+$/)) {
      const [amount, symbol] = args1.split(' ')
      invariant(Asset.isValidSymbol(symbol), `Invalid asset symbol: ${symbol}`)
      const precision = Asset.getPrecision(symbol)
      const fai = Asset.getIdentifier(symbol)
      const amountBigInt = BigInt(Number(amount) * (10 ** precision))
      return new Asset(amountBigInt.toString(), precision, fai)
    }
    // overload 4 from number and symbol
    else if (typeof args1 === 'number' || (typeof args1 === 'string' && args1.match(/^\d+$/))) {
      const symbol = (args2 as AssetSymbol) || 'YANG'
      const precision = Asset.getPrecision(symbol)
      const amount = BigInt(Number(args1) * (10 ** precision))
      invariant(Asset.isValidSymbol(symbol), `Invalid asset symbol: ${symbol}`)
      const fai = Asset.getIdentifier(symbol)
      return new Asset(amount.toString(), precision, fai)
    }
    // overload 2 from fai asset object
    else if (typeof args1 === 'object') {
      invariant(args1.amount, 'amount must be provided')
      invariant(args1.precision, 'precision must be provided')
      invariant(args1.fai, 'fai must be provided')
      return new Asset(args1.amount.toString(), args1.precision, args1.fai)
    }
    // overload 5 from bigint, precision and fai
    else if (typeof args1 === 'bigint') {
      invariant(typeof args2 === 'number', 'precision must be a number')
      invariant(typeof args1 === 'bigint', 'amount must be a bigint')
      invariant(typeof args2 === 'number', 'precision must be a number')
      invariant(args3, 'fai must be provided when using bigint amount')
      return new Asset(args1.toString(), args2, args3)
    }
    throw new TypeError('Invalid asset')
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

  /**
   * 根据 identifier 返回资产的 symbol
   */
  static getSymbolByIdentifier(fai: `@@${string}`): AssetSymbol {
    switch (fai) {
      case '@@000000013':
        return 'YIN'
      case '@@000000021':
        return 'YANG'
      case '@@000000037':
        return 'QI'
      case '@@000000045':
        return 'GOLD'
      case '@@000000059':
        return 'FOOD'
      case '@@000000068':
        return 'WOOD'
      case '@@000000076':
        return 'FABR'
      case '@@000000084':
        return 'HERB'
      default:
        throw new Error(`Not implemented fai: ${fai}`)
    }
  }

  /**
   * 返回两个资产中较小的一个。
   */
  public static min(a: Asset, b: Asset) {
    invariant(a.fai === b.fai, 'Can\'t compare assets with different type asset')
    return a.amount < b.amount ? a : b
  }

  /**
   * 返回两个资产中较大的一个。
   */
  public static max(a: Asset, b: Asset) {
    invariant(a.fai === b.fai, 'Can\'t compare assets with different type asset')
    return a.amount > b.amount ? a : b
  }

  /**
   * 返回一个新实例为两个资产相加。
   */
  public add(other: Asset): Asset {
    invariant(this.fai === other.fai, 'Can\'t add with different type asset')
    const amount = BigInt(this.amount) + BigInt(other.amount)
    return new Asset(amount.toString(), this.precision, this.fai)
  }

  /**
   * 返回一个新实例为两个资产相减。
   */
  public subtract(other: Asset): Asset {
    invariant(this.fai === other.fai, 'Can\'t subtract with different type asset')
    const amount = BigInt(this.amount) - BigInt(other.amount)
    return new Asset(amount.toString(), this.precision, this.fai)
  }

  /**
   * 返回一个新实例为两个资产相乘。
   */
  public multiply(other: Asset): Asset {
    invariant(this.fai === other.fai, 'Can\'t multiply with different type asset')
    const amount = BigInt(this.amount) * BigInt(other.amount)
    return new Asset(amount.toString(), this.precision, this.fai)
  }

  /**
   * 返回一个新实例为两个资产相除。
   */
  public divide(other: Asset): Asset {
    invariant(this.fai === other.fai, 'Can\'t divide with different type asset')
    const amount = BigInt(this.amount) / BigInt(other.amount)
    return new Asset(amount.toString(), this.precision, this.fai)
  }

  toString() {
    const value = `${(Number(this.amount) / 10 ** this.precision).toFixed(this.precision)}`
    const symbol = Asset.getSymbolByIdentifier(this.fai)
    return `${value} ${symbol}`
  }

  toJSON() {
    return {
      amount: this.amount.toString(),
      precision: this.precision,
      fai: this.fai,
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
