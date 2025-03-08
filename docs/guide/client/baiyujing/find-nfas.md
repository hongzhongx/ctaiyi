# findNfas

通过 NFA id 查找多个 NFA 信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const nfas = await client.baiyujing.findNfas([1, 2, 3])
```

## 返回值

[`Nfa[]`](/guide/types#nfa)

返回 NFA 对象数组。每个对象包含 NFA 的详细信息。

## 参数

### nfaIds

- 类型: `number[]`

NFA ID 数组
