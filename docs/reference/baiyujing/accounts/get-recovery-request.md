# getRecoveryRequest

获取账户的恢复请求信息。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| account | string | 账户名 |

## 返回值

返回账户恢复请求对象，如果没有恢复请求则返回 null。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const recoveryRequest = await client.baiyujing.getRecoveryRequest('alice')
//    ^?
```
