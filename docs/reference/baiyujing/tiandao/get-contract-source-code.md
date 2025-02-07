# getContractSourceCode

获取智能合约的源代码。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const code = await client.baiyujing.getContractSourceCode('contract.cmds.std.look')
//    ^?
```

## 参数

### contractName

- 类型: `string`

合约名称

## 返回值

`string`

返回合约 lua 源代码字符串。
