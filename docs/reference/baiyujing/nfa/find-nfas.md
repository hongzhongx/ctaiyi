# findNfas

批量查找 NFA 信息。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const nfas = await client.baiyujing.findNfas([1, 2, 3])
//    ^?
```

## 返回值

`Nfa[]`

返回 NFA 对象数组。每个对象包含 NFA 的详细信息。

## 参数

### nfaIds

- 类型: `number[]`

NFA ID 数组
