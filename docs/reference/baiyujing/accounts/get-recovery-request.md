# getRecoveryRequest

获取账户的恢复请求信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const recoveryRequest = await client.baiyujing.getRecoveryRequest('alice')
```

## 返回值

`RecoveryRequest` | `null`

返回账户恢复请求对象，如果没有恢复请求则返回 `null`。

```ts twoslash
import { AuthorityType } from '@taiyinet/ctaiyi'
// ---cut---
declare interface RecoveryRequest {
  id: number
  account_to_recover: string
  new_owner_authority: AuthorityType
  expires: number
}
```

## 参数

### account

- 类型: `string`

账户名
