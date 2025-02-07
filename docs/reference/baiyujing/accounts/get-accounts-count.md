# getAccountsCount

获取链上的总账户数量。

## 参数

无

## 返回值

返回账户总数（number 类型）。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const count = await client.baiyujing.getAccountsCount()
//    ^?
```
