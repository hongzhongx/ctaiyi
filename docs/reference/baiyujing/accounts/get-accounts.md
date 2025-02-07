# getAccounts

获取指定账户的详细信息。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| accounts | string[] | 要查询的账户名数组 |

## 返回值

返回账户对象数组。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const accounts = await client.baiyujing.getAccounts(['sifu'])
//    ^?
```
