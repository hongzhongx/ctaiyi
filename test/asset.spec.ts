import { Asset, getQiPrice, Price } from './../src'

describe('asset', () => {
  it('should create from string', () => {
    const oneYang = Asset.fromString('1.000 YANG')
    assert.equal(oneYang.amount, 1)
    assert.equal(oneYang.symbol, 'YANG')
    const qi = Asset.fromString('0.123456 QI')
    assert.equal(qi.amount, 0.123456)
    assert.equal(qi.symbol, 'QI')
  })

  it('should convert to string', () => {
    const yang = new Asset(44.999999, 'YANG')
    assert.equal(yang.toString(), '45.000 YANG')
    const qi = new Asset(44.999999, 'QI')
    assert.equal(qi.toString(), '44.999999 QI')
  })

  it('should add and subtract', () => {
    const a = new Asset(44.999, 'YANG')
    assert.equal(a.subtract(1.999).toString(), '43.000 YANG')
    assert.equal(a.add(0.001).toString(), '45.000 YANG')
    assert.equal(Asset.from('1.999 YANG').subtract(a).toString(), '-43.000 YANG')
    assert.equal(Asset.from(a).subtract(a).toString(), '0.000 YANG')
    assert.equal(Asset.from('99.999999 QI').add('0.000001 QI').toString(), '100.000000 QI')
    assert.throws(() => Asset.fromString('100.000 YANG').subtract('100.000000 QI'))
    assert.throws(() => Asset.from(100, 'QI').add(a))
    assert.throws(() => Asset.from(100).add('1.000000 QI'))
  })

  it('should max and min', () => {
    const a = Asset.from(1)
    const b = Asset.from(2)
    assert.equal(Asset.min(a, b), a)
    assert.equal(Asset.min(b, a), a)
    assert.equal(Asset.max(a, b), b)
    assert.equal(Asset.max(b, a), b)
  })

  it('should throw on invalid values', () => {
    assert.throws(() => Asset.fromString('1.000 SNACKS'))
    assert.throws(() => Asset.fromString('I LIKE TURT 0.42'))
    assert.throws(() => Asset.fromString('Infinity YANG'))
    assert.throws(() => Asset.fromString('..0 YANG'))
    assert.throws(() => Asset.from('..0 YANG'))
    assert.throws(() => Asset.from(Number.NaN))
    assert.throws(() => Asset.from(false as any))
    assert.throws(() => Asset.from(Infinity))
    assert.throws(() => Asset.from({ bar: 22 } as any))
  })

  it('should parse price', () => {
    const price1 = new Price(Asset.from('1.000 YANG'), Asset.from(1, 'YIN'))
    const price2 = Price.from(price1)
    const price3 = Price.from({ base: '1.000 YANG', quote: price1.quote })
    assert.equal(price1.toString(), '1.000 YANG:1.000 YIN')
    assert.equal(price2.base.toString(), price3.base.toString())
    assert.equal(price2.quote.toString(), price3.quote.toString())
  })

  it('should get qi price', () => {
    const price1 = getQiPrice()
    assert.equal(price1.base.amount, 1)
    assert.equal(price1.base.symbol, 'YANG')
    assert.equal(price1.quote.amount, 1)
    assert.equal(price1.quote.symbol, 'QI')
  })

  it('should convert price', () => {
    const price1 = new Price(Asset.from('0.500 YANG'), Asset.from('1.000 YIN'))
    const v1 = price1.convert(Asset.from('1.000 YANG'))
    assert.equal(v1.amount, 2)
    assert.equal(v1.symbol, 'YIN')
    const v2 = price1.convert(Asset.from('1.000 YIN'))
    assert.equal(v2.amount, 0.5)
    assert.equal(v2.symbol, 'YANG')
    assert.throws(() => {
      price1.convert(Asset.from(1, 'QI'))
    })
  })
})
