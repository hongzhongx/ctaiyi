# getPotentialSignatures

获取交易的潜在签名者。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| transaction | object | 交易对象 |

## 返回值

返回可能需要签名的公钥数组。

## 示例

```ts
const potentialKeys = await client.baiyujing.getPotentialSignatures({
  operations: [/* 操作数组 */],
  extensions: []
})
```
