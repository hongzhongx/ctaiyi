# getWithdrawRoutes

获取账户的提现路由设置。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const routes = await client.baiyujing.getWithdrawRoutes('sifu', 'all')
//    ^?
```

## 返回值

`WithdrawRoute[]`

返回提现路由设置数组。

## 参数

### account

- 类型: `string`

账户名

### withdrawRouteType

- 类型: `'incoming' | 'outgoing' | 'all'`

提现路由类型
