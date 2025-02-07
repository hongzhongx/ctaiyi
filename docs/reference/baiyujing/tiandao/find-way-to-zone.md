# findWayToZone

查找到达目标区域的路径。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| fromZone | string | 起始区域名称 |
| toZone | string | 目标区域名称 |

## 返回值

返回路径对象，包含从起始区域到目标区域的可行路径。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const zones = await client.baiyujing.findWayToZone('牛心村', '大梁')
//    ^?
```
