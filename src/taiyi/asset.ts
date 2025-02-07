import invariant from 'tiny-invariant'

export interface FaiAsset {
  amount: string | number
  precision: number
  fai: string
}

/**
 * 资产 symbol
 */
export type AssetSymbol = 'YANG' | 'YIN' | 'QI' | 'GOLD' | 'FOOD' | 'WOOD' | 'FABR' | 'HERB'

/**
 * 表示太乙资产的类，例如 `1.000 QI` 或 `12.112233 YANG`。
 */
export class Asset {
  /**
   * 从字符串创建一个 Asset 实例，例如 `42.000 QI` 或者 `4.2 \@@000000021`。
   */
  public static fromString(string: string, expectedSymbol?: AssetSymbol) {
    const [amountString, symbol] = string.split(' ')

    let _symbol = symbol as AssetSymbol
    let isFai = false
    // 字符串的 symbol 是 fai 表示
    if (symbol.startsWith('@@')) {
      _symbol = Asset.getSymbolFromFai(symbol)
      isFai = true
    }

    if (!['YANG', 'YIN', 'QI', 'GOLD', 'FOOD', 'WOOD', 'FABR', 'HERB'].includes(_symbol)) {
      throw new Error(`Invalid asset symbol: ${_symbol}`)
    }
    if (expectedSymbol && _symbol !== expectedSymbol) {
      throw new Error(`Invalid asset, expected symbol: ${expectedSymbol} got: ${_symbol}`)
    }
    const amount = Number.parseFloat(amountString)
    if (!Number.isFinite(amount)) {
      throw new TypeError(`Invalid asset amount: ${amountString}`)
    }
    return new Asset(amount, _symbol, isFai)
  }

  /**
   * 创建新的 Asset。
   *
   * @param value 资产额度。
   * @param symbol 创建时使用的 symbol。也会用于验证资产，如果传递的值具有不同的 symbol 则会抛出错误。
   * @param isFai 是否是 fai 表示。
   */
  public static from(value: string | Asset | number | FaiAsset, symbol?: AssetSymbol, isFai?: boolean) {
    if (value instanceof Asset) {
      if (symbol && value.symbol !== symbol) {
        throw new Error(`Invalid asset, expected symbol: ${symbol} got: ${value.symbol}`)
      }
      return value
    }
    else if (typeof value === 'number' && Number.isFinite(value)) {
      return new Asset(value, symbol || 'YANG', isFai)
    }
    else if (typeof value === 'string') {
      return Asset.fromString(value, symbol)
    }
    else if (typeof value === 'object' && 'amount' in value && 'precision' in value && 'fai' in value) {
      const amount = typeof value.amount === 'string' ? Number.parseFloat(value.amount) : value.amount
      if (!Number.isFinite(amount)) {
        throw new TypeError(`Invalid asset amount: ${amount}`)
      }
      return new Asset(amount, Asset.getSymbolFromFai(value.fai), true)
    }
    else {
      throw new Error(`Invalid asset '${String(value)}'`)
    }
  }

  /**
   * 返回两个资产中较小的一个。
   */
  public static min(a: Asset, b: Asset) {
    invariant(a.symbol === b.symbol, 'can not compare assets with different symbols')
    return a.amount < b.amount ? a : b
  }

  /**
   * 返回两个资产中较大的一个。
   */
  public static max(a: Asset, b: Asset) {
    invariant(a.symbol === b.symbol, 'can not compare assets with different symbols')
    return a.amount > b.amount ? a : b
  }

  constructor(
    public readonly amount: number,
    public readonly symbol: AssetSymbol,
    public readonly isFai = false,
  ) { }

  /**
   * 返回资产的精度。
   */
  public getPrecision(): number {
    switch (this.symbol) {
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
   * 返回 fai 表示
   */
  static getFaiFromSymbol(symbol: string): string {
    switch (symbol) {
      case 'YANG':
        return '@@000000021'
      case 'QI':
        return '@@000000037'
      case 'GOLD':
      case 'FOOD':
      case 'WOOD':
      case 'FABR':
      case 'HERB':
      default:
        throw new Error(`Not implemented symbol: ${symbol}`)
    }
  }

  static getSymbolFromFai(fai: string): AssetSymbol {
    switch (fai) {
      case '@@000000021':
        return 'YANG'
      case '@@000000037':
        return 'QI'
      default:
        throw new Error(`Not implemented fai: ${fai}`)
    }
  }

  /**
   * 返回一个新实例为两个资产相加。
   */
  public add(amount: Asset | string | number): Asset {
    const other = Asset.from(amount, this.symbol)
    invariant(this.symbol === other.symbol, 'can not add with different symbols')
    return new Asset(this.amount + other.amount, this.symbol)
  }

  /**
   * 返回一个新实例为两个资产相减。
   */
  public subtract(amount: Asset | string | number): Asset {
    const other = Asset.from(amount, this.symbol)
    invariant(this.symbol === other.symbol, 'can not subtract with different symbols')
    return new Asset(this.amount - other.amount, this.symbol)
  }

  /**
   * 返回一个新实例为两个资产相乘。
   */
  public multiply(factor: Asset | string | number): Asset {
    const other = Asset.from(factor, this.symbol)
    invariant(this.symbol === other.symbol, 'can not multiply with different symbols')
    return new Asset(this.amount * other.amount, this.symbol)
  }

  /**
   * 返回一个新实例为两个资产相除。
   */
  public divide(divisor: Asset | string | number): Asset {
    const other = Asset.from(divisor, this.symbol)
    invariant(this.symbol === other.symbol, 'can not divide with different symbols')
    return new Asset(this.amount / other.amount, this.symbol)
  }

  /**
   * 返回资产的字符串表示，例如 `42.000 QI`。
   */
  public toString(): string {
    return `${this.amount.toFixed(this.getPrecision())} ${this.symbol}`
  }

  /**
   * 用于 JSON 序列化
   */
  public toJSON(): string {
    if (this.isFai) {
      return JSON.stringify({
        amount: this.amount,
        precision: this.getPrecision(),
        fai: Asset.getFaiFromSymbol(this.symbol),
      })
    }
    return this.toString()
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
      return new Price(Asset.from(value.base), Asset.from(value.quote))
    }
  }

  /**
   * @param base  - 表示价格对象的值相对于报价资产的值。不能有 amount == 0，否则断言失败。
   * @param quote - 表示相对资产。不能有 amount == 0，否则断言失败。
   *
   * base 和 quote 必须具有不同的 symbol 定义。
   */
  constructor(public readonly base: Asset, public readonly quote: Asset) {
    invariant(base.amount !== 0 && quote.amount !== 0, 'base and quote assets must be non-zero')
    invariant(base.symbol !== quote.symbol, 'base and quote can not have the same symbol')
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
    if (asset.symbol === this.base.symbol) {
      invariant(this.base.amount > 0)
      return new Asset(asset.amount * this.quote.amount / this.base.amount, this.quote.symbol)
    }
    else if (asset.symbol === this.quote.symbol) {
      invariant(this.quote.amount > 0)
      return new Asset(asset.amount * this.base.amount / this.quote.amount, this.base.symbol)
    }
    else {
      throw new Error(`Can not convert ${asset} with ${this}`)
    }
  }
}
