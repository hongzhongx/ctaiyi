# getSimings

获取司命列表。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const simings = await client.baiyujing.getSimings([0])
//    ^?
```

## 返回值

`Siming[]`

返回司命对象数组。每个对象包含司命的详细信息。

## 参数

### simingIds

- 类型: `number[]`

司命 ID 数组
