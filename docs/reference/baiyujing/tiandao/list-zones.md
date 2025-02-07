# listZones

获取区域列表。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| account | string | 账户名 |
| limit | number | 返回的最大数量（可选，默认: 100） |

## 返回值

返回区域对象数组。每个对象包含区域的详细信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const zones = await client.baiyujing.listZones('sifu', 10)
//    ^?
```
