# findZonesByName

按名称查找区域。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| names | string[] | 区域名称数组 |

## 返回值

返回区域对象数组。每个对象包含区域的详细信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const zones = await client.baiyujing.findZonesByName(['牛心村'])
//    ^?
```
