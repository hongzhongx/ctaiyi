# findActors

通过角色 id 查找多个角色信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const actors = await client.baiyujing.findActors([1, 2, 3])
```

## 返回值

[`Actor[]`](/guide/types#actor)

返回角色对象数组。每个对象包含角色的详细信息。

## 参数

### actorIds

- 类型: `number[]`

角色 ID 数组
