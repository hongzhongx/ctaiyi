# findZones

查找指定的区域信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const zones = await client.baiyujing.findZones([1, 2])
```

## 返回值

[`Zone[]`](/guide/types#zone)

返回区域对象数组。每个对象包含区域的详细信息。

## 参数

### zoneIds

- 类型: `number[]`

区域 ID 数组
