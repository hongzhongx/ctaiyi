# findActor

查找指定的角色信息。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| name | string | 角色名称 |

## 返回值

返回角色对象。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const actor = await client.baiyujing.findActor('李火旺')
//    ^?
```
