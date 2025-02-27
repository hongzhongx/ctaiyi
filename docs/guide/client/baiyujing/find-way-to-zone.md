# findWayToZone

查找到达目标区域的路径。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const zones = await client.baiyujing.findWayToZone('牛心村', '大梁')
```

## 返回值

`ZonePath`

返回路径对象，包含从起始区域到目标区域的可行路径。

```ts twoslash
declare interface ZonePath {
  way_points: string[]
}
```

## 参数

### fromZone

- 类型: `string`

起始区域名称

### toZone

- 类型: `string`

目标区域名称
