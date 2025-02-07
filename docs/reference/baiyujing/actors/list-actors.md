# listActors

获取角色列表。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const actors = await client.baiyujing.listActors('sifu', 10)
```

## 返回值

[`Actor[]`](/reference/types#actor)

返回角色对象数组。每个对象包含角色的详细信息。

## 参数

### account

- 类型: `string`

账户名

### limit

- 类型: `number`

返回的最大数量（可选，默认: 100）
