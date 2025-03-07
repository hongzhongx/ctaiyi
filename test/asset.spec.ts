import type { AssetSymbol } from './../src'
import { Asset } from './../src'

describe('asset', () => {
  const assets = [
    { symbol: 'YIN', precision: 3, fai: '@@000000013' },
    { symbol: 'YANG', precision: 3, fai: '@@000000021' },
    { symbol: 'QI', precision: 6, fai: '@@000000037' },
    { symbol: 'GOLD', precision: 6, fai: '@@000000045' },
    { symbol: 'FOOD', precision: 6, fai: '@@000000059' },
    { symbol: 'WOOD', precision: 6, fai: '@@000000068' },
    { symbol: 'FABR', precision: 6, fai: '@@000000076' },
    { symbol: 'HERB', precision: 6, fai: '@@000000084' },
  ] as { symbol: AssetSymbol, precision: number, fai: `@@${string}` }[]

  describe.each(assets)('asset $symbol', (asset) => {
    it('should create asset from numberic amount and symbol', () => {
      const result = Asset.from(1, asset.symbol)
      expect(result.amount).toBe(`1${'0'.repeat(asset.precision)}`)
      expect(result.precision).toBe(asset.precision)
      expect(result.fai).toBe(asset.fai)

      const result2 = Asset.from('1', asset.symbol)
      expect(result2.amount).toBe(`1${'0'.repeat(asset.precision)}`)
      expect(result2.precision).toBe(asset.precision)
      expect(result2.fai).toBe(asset.fai)
    })

    it('should create asset from legacy asset string', () => {
      const result = Asset.from(`1.${'0'.repeat(asset.precision)} ${asset.symbol}`)
      expect(result.amount).toBe(`1${'0'.repeat(asset.precision)}`)
      expect(result.precision).toBe(asset.precision)
      expect(result.fai).toBe(asset.fai)
    })

    it('should create asset from bigint amount, precision and symbol', () => {
      const value = `1${'0'.repeat(asset.precision)}`
      const result = Asset.from(BigInt(value), asset.precision, asset.fai)
      expect(result.amount).toBe(value)
      expect(result.precision).toBe(asset.precision)
      expect(result.fai).toBe(asset.fai)
    })

    it('should toString to legacy asset string', () => {
      const value = `1${'0'.repeat(asset.precision)}`
      const result = Asset.from(BigInt(value), asset.precision, asset.fai)
      expect(result.toString()).toBe(`1.${'0'.repeat(asset.precision)} ${asset.symbol}`)
    })

    it('should serialize property', () => {
      const result = Asset.from(1_000n, asset.precision, asset.fai)
      expect(JSON.stringify(result)).matchSnapshot()
    })
  })

  it('should use YANG as default symbol when no symbol provided', () => {
    const result = Asset.from('1')
    expect(result.amount).toBe('1000')
    expect(result.precision).toBe(3)
    expect(result.fai).toBe('@@000000021')
  })
})
