# getAccountHistory

从 start 参数开始反向遍历获取指定账户的历史操作记录。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const history = await client.baiyujing.getAccountHistory('initminer', 10, 1)
```

## 返回值

`AccountHistory[]`

返回账户历史操作记录数组。每条记录包含操作类型、时间戳、交易ID等信息。

```ts twoslash
import { AppliedOperation } from '@taiyinet/ctaiyi'
// ---cut---
declare type AccountHistory = [nonce: number, op: AppliedOperation]
```

## 参数

### account

- 类型: `string`

账户名

### start

- 类型: `number`

起始序号（可选）

### limit

- 类型: `number`

返回的最大数量（可选，默认: 100）
