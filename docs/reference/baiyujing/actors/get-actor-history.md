# getActorHistory

获取角色的历史记录。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const history = await client.baiyujing.getActorHistory('李火旺', 10, 10)
```

## 返回值

`ActorHistory[]`

返回角色历史记录数组。每条记录包含操作类型、时间戳、变更详情等信息。

```ts twoslash
import { AppliedOperation } from '@taiyinet/ctaiyi'
// ---cut---
declare type ActorHistory = [nonce: number, op: AppliedOperation]
```

## 参数

### name

- 类型: `string`

角色名称

### start

- 类型: `number`

起始序号（可选）

### limit

- 类型: `number`

返回的最大数量（可选，默认: 100）
