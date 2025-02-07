# lookupAccounts

按前缀搜索账户名。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const accounts = await client.baiyujing.lookupAccounts('ali', 10)
//    ^?
```

## 返回值

`string[]`

返回匹配前缀的账户名数组。

## 参数

### lowerBoundName

- 类型: `string`

账户名搜索的下界（前缀）

### limit

- 类型: `number`

返回的最大数量（可选，默认: 100）
