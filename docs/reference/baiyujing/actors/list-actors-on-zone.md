# listActorsOnZone

获取指定区域中的角色列表。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| zoneId | number | 区域 ID |
| limit | number | 返回的最大数量（可选，默认: 100） |

## 返回值

返回在指定区域中的角色对象数组。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const actors = await client.baiyujing.listActorsOnZone(0, 10)
//    ^?
```
