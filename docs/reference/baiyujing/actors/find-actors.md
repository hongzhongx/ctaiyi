# findActors

批量查找角色信息。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| actorIds | number[] | 角色 ID 数组 |

## 返回值

返回角色对象数组。每个对象包含角色的详细信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const actors = await client.baiyujing.findActors([1, 2, 3])
//    ^?
```
