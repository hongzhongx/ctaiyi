# getAccountResources

获取账户的资源使用情况。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const resources = await client.baiyujing.getAccountResources(['sifu'])
//    ^?
```

## 返回值

`AccountResources[]`

返回账户资源使用情况对象数组。

## 参数

### accounts

- 类型: `string[]`

账户名数组
