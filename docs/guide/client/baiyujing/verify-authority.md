# verifyAuthority

验证交易的权限是否满足要求。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const authority = await client.baiyujing.verifyAuthority({
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

`boolean`

返回布尔值，表示权限是否满足要求。

## 参数

### trx

- 类型: [`SignedTransaction`](/guide/types#signedtransaction)

交易对象
