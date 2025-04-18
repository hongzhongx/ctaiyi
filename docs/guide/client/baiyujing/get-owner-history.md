# getOwnerHistory

获取账户的 owner key 变更历史。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const history = await client.baiyujing.getOwnerHistory('sifu')
```

## 返回值

`OwnerHistory[]`

```ts twoslash
import { AuthorityType } from '@taiyinet/ctaiyi'
// ---cut---
declare interface OwnerHistory {
  id: number
  account: string
  previous_owner_authority: AuthorityType
  last_valid_time: number
}
```

获取账户的 owner key 变更历史数组。

## 参数

### account

- 类型: `string`

要查询的账户名
