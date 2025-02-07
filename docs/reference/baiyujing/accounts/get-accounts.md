# getAccounts

获取指定账户的详细信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const accounts = await client.baiyujing.getAccounts(['sifu'])
//    ^?
```

## 返回值

`Account[]`

查询的账户对象数组。

## 参数

### accounts

- 类型: `string[]`

要查询的账户名数组
