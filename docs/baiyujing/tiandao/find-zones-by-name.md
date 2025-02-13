# findZonesByName

按名称查找区域。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const zones = await client.baiyujing.findZonesByName(['牛心村'])
```

## 返回值

[`Zone[]`](/reference/types#zone)

返回区域对象数组。每个对象包含区域的详细信息。

## 参数

### names

- 类型: `string[]`

区域名称数组
