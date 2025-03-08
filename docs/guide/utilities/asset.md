# 资产 (Asset)

简化太乙区块链中资产的使用。通过描述资产的数量和小数位以及 fai 标识符来确定一个资产数值，与 [`SGTAsset`](../types#sgtasset) 对象兼容

> [!TIP]
> 就当前的状态来说，你应该用不到这个类，描述一个资产只需要使用形如 “1.000 YANG” 的字符串形式即可，这个类只用在内部做一些校验工作。

## 使用

下面的示例都是创建了标识 `"1.000 YANG"` 即一个单位的 YANG 的资产

```typescript twoslash
import { Asset } from '@taiyinet/ctaiyi'
// ---cut---
// 从 legacy 资产字符串创建一个 Asset 对象
const assetFromString = Asset.from('1.000 YANG')

// 从 SGTAsset 对象创建一个 Asset 对象
const assetFromSMT = Asset.from({ amount: '1000', precision: 3, fai: '@@000000021' })

// 通过数额和资产符号创建一个 Asset 对象，如果是 `YANG` 则 symbol 参数可以省略
const assetFromAmount = Asset.from(1, 'YANG')

// 从 bigint ， precision，fai 标识创建
const assetFromBigInt = Asset.fromBigInt(1000n, 3, '@@000000021')
```
