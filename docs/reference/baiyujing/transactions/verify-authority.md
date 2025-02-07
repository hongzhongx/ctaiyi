# verifyAuthority

验证交易的权限是否满足要求。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| transaction | object | 交易对象 |

## 返回值

返回布尔值，表示权限是否满足要求。

## 示例

```ts
const isValid = await client.baiyujing.verifyAuthority({
  operations: [/* 操作数组 */],
  extensions: []
})
```
