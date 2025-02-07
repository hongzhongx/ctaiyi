# getAccountHistory

获取账户的历史操作记录。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| account | string | 账户名 |
| start | number | 起始序号（可选） |
| limit | number | 返回的最大数量（可选，默认: 100） |

## 返回值

返回账户历史操作记录数组。每条记录包含操作类型、时间戳、交易ID等信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const history = await client.baiyujing.getAccountHistory('initminer', 10, 1)
//    ^?
```
