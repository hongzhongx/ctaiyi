# verifyAccountAuthority

验证账户的权限是否满足要求。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const authority = await client.baiyujing.verifyAccountAuthority('temp', [])
//    ^?
```

## 返回值

`boolean`

返回布尔值，表示账户权限是否满足要求。

## 参数

### account

- 类型: `string`

账户名

### keys

- 类型: `string[]`

公钥数组
