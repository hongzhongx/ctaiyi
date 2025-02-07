# listNfas

获取 NFA 列表。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const nfas = await client.baiyujing.listNfas('sifu', 10)
//    ^?
```

## 返回值

`Nfa[]`

返回 NFA 对象数组。每个对象包含 NFA 的详细信息。

## 参数

### account

- 类型: `string`

账户名

### limit

- 类型: `number`

返回的最大数量（可选，默认: 100）
