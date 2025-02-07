# getTransactionHex

获取交易的十六进制表示。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| transaction | object | 交易对象 |

## 返回值

返回交易的十六进制字符串。

## 示例

```ts
const hex = await client.baiyujing.getTransactionHex({
  operations: [/* 操作数组 */],
  extensions: []
})
```
