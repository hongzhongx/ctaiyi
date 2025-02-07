# getNfaHistory

获取 NFA 的历史记录。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const history = await client.baiyujing.getNfaHistory(1, 20, 10)
//    ^?
```

## 返回值

`NfaHistory[]`

返回 NFA 历史记录数组。每条记录包含操作类型、时间戳、变更详情等信息。

## 参数

### nfaId

- 类型: `number`

NFA ID

### start

- 类型: `number`

起始序号（可选）

### limit

- 类型: `number`

返回的最大数量（可选，默认: 100）
