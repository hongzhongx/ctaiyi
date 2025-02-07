# getTransactionResults

获取交易执行结果。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const results = await client.baiyujing.getTransactionResults('abcd1234...')
//    ^?
```

## 返回值

[`AppliedOperation`](/reference/types#appliedoperation)

交易成功执行的操作数组

## 参数

### transactionId

- 类型: `string`

交易 ID
