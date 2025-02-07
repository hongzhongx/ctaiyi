# getRequiredSignatures

获取交易所需的签名。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| transaction | object | 交易对象 |
| availableKeys | string[] | 可用的公钥数组 |

## 返回值

返回交易所需的公钥数组。

## 示例

```ts
const requiredKeys = await client.baiyujing.getRequiredSignatures({
  operations: [/* 操作数组 */],
  extensions: []
}, ['PUBLIC_KEY_1', 'PUBLIC_KEY_2'])
```
