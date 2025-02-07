# getSimingCount

获取链上的总司命数量。

## 参数

无

## 返回值

返回司命总数（number 类型）。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const count = await client.baiyujing.getSimingCount()
//    ^?
```
