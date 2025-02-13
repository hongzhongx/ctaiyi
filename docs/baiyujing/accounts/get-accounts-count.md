# getAccountsCount

获取系统中的账户总数。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const count = await client.baiyujing.getAccountsCount()
```

## 返回值

`number`

系统中的账户总数。

## 参数

此方法不需要参数。
