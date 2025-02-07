# listZonesByType

按类型获取区域列表。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const zones = await client.baiyujing.listZonesByType('XUKONG', 10)
//    ^?
```

## 返回值

`Zone[]`

返回指定类型的区域对象数组。

## 参数

### type

- 类型: `string`

区域类型

### limit

- 类型: `number`

返回的最大数量（可选，默认: 100）
