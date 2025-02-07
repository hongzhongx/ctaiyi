# getQiDelegations

获取账户的 「QI」 委托信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const delegations = await client.baiyujing.getQiDelegations('sifu', 10, 10)
//    ^?
```

## 返回值

[`QiDelegation[]`](/reference/types#qidelegation)

返回 「QI」 委托信息数组，包含委托人、被委托人、委托数量等信息。

## 参数

### account

- 类型: `string`

账户名

### from

- 类型: `number`

起始索引（可选）

### limit

- 类型: `number`

返回的最大数量（可选，默认: 100）
