# getOwnerHistory

获取账户的所有权变更历史。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| account | string | 账户名 |

## 返回值

返回账户所有权变更历史记录数组，包含变更时间、新旧所有者等信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const ownerHistory = await client.baiyujing.getOwnerHistory('alice')
//    ^?
```
