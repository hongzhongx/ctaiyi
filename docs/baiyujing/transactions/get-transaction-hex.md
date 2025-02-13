# getTransactionHex

获取交易的十六进制表示。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const hex = await client.baiyujing.getTransactionHex({
  expiration: '2025-02-04T16:05:57',
  extensions: [],
  operations: [
    [
      'transfer_to_qi',
      {
        amount: '10.000 YANG',
        from: 'initminer',
        to: 'dage',
      },
    ],
  ],
  ref_block_num: 21701,
  ref_block_prefix: 1734260487,
  signatures: [
    '2040d2b937d51ff4c4ac08bbd6c5df5f4bfcb3973ab8aeafe229845e0ff3c5f6a629f4dbe96633abd377fdc5521947b64ae4a41faecffbc5a4d1fe0cd49f0bcf7e',
  ],
})
```

## 返回值

`string`

返回交易的十六进制字符串。

## 参数

### transaction

- 类型: [`Transaction`](/reference/types#transaction)

交易对象
