# getAccountResources

获取账户的资源使用情况。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| accounts | string[] | 账户名数组 |

## 返回值

返回账户资源使用情况对象数组。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const resources = await client.baiyujing.getAccountResources(['sifu'])
//    ^?
```
