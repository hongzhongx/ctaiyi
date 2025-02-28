# getTiandaoProperties

获取天道系统属性。

## 示例

```ts twoslash
import { Client } from '@taiyinet/ctaiyi'
declare const client: Client
// ---cut---
const properties = await client.baiyujing.getTiandaoProperties()
```

## 返回值

[`TianDaoProperties`](/guide/types#tiandaoproperties)

返回天道系统属性对象。

## 参数

此方法不需要参数。
