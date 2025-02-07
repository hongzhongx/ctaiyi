# listToZonesByFrom

获取从指定区域可到达的目标区域列表。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const toZones = await client.baiyujing.listToZonesByFrom('牛心村', 10)
```

## 返回值

[`Zone[]`](/reference/types#zone)

返回可到达的目标区域对象数组。

## 参数

### fromZoneName

- 类型: `string`

起始区域名称

### limit

- 类型: `number`

返回的最大数量（可选，默认: 100）
