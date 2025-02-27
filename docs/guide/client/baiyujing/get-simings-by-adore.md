# getSimingsByAdore

获取指定账户信仰的司命列表。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const simings = await client.baiyujing.getSimingsByAdore('initminer', 10)
```

## 返回值

[`Siming[]`](/guide/types#siming)

返回账户所信仰的司命对象数组。

## 参数

### account

- 类型: `string`

账户名

### limit

- 类型: `number`

返回的最大数量（可选，默认: 100）
