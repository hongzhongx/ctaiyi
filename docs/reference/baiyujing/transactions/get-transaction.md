# getTransaction

获取交易详情。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| transactionId | string | 交易 ID |

## 返回值

返回交易对象，包含交易的详细信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const transaction = await client.baiyujing.getTransaction('903430761b97a2ce7be79b578700ebc1598c05c9')
//    ^?
```
