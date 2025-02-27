# listActorsOnZone

获取指定区域中的角色列表。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const actors = await client.baiyujing.listActorsOnZone(0, 10)
```

## 返回值

[`Actor[]`](/guide/types#actor)

返回在指定区域中的角色对象数组。

## 参数

### zoneId

- 类型: `number`

区域 ID

### limit

- 类型: `number`

返回的最大数量（可选，默认: 100）
