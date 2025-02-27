# listActorsBelowHealth

获取健康值低于指定值的角色列表。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const actors = await client.baiyujing.listActorsBelowHealth(0, 1)
```

## 返回值

[`Actor[]`](/guide/types#actor)

返回健康值低于指定值的角色对象数组。

## 参数

### health

- 类型: `number`

健康值阈值

### limit

- 类型: `number`

返回的最大数量（可选，默认: 100）
