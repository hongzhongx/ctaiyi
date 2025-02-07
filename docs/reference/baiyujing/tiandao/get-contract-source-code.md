# getContractSourceCode

获取智能合约的源代码。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| contractName | string | 合约名称 |

## 返回值

返回合约源代码字符串。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const code = await client.baiyujing.getContractSourceCode('contract.cmds.std.look')
//    ^?
```
