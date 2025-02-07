# listZonesByType

按类型获取区域列表。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| type | string | 区域类型 |
| limit | number | 返回的最大数量（可选，默认: 100） |

## 返回值

返回指定类型的区域对象数组。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const zones = await client.baiyujing.listZonesByType('XUKONG', 10)
//    ^?
```
