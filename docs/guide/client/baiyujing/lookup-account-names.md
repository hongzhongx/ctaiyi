# lookupAccountNames

通过账户名查找账户信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const accounts = await client.baiyujing.lookupAccountNames(['sifu'])
```

## 返回值

[`Account[]`](/guide/types#account)

返回账户对象数组。

## 参数

### accountNames

- 类型: `string[]`

要查找的账户名数组
