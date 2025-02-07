# getExpiringQiDelegations

获取即将到期的气力委托信息。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| account | string | 账户名 |
| days | number | 未来几天内到期（可选，默认: 7） |

## 返回值

返回即将到期的气力委托信息数组，包含委托人、被委托人、委托数量、到期时间等信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const expiringDelegations = await client.baiyujing.getExpiringQiDelegations('alice', 3)
//    ^?
```
