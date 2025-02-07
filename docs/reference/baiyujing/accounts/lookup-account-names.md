# lookupAccountNames

通过账户名查找账户信息。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| accountNames | string[] | 要查找的账户名数组 |

## 返回值

返回账户对象数组。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const accounts = await client.baiyujing.lookupAccountNames(['sifu'])
//    ^?
```
