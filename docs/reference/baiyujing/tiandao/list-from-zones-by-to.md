# listFromZonesByTo

获取可到达指定目标区域的起始区域列表。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const zones = await client.baiyujing.listFromZonesByTo('牛心村', 10)
//    ^?
```

## 返回值

`Zone[]`

返回可到达目标区域的起始区域对象数组。

## 参数

### toZone

- 类型: `string`

目标区域名称

### limit

- 类型: `number`

返回的最大数量（可选，默认: 100）
