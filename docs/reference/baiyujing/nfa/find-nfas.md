# findNfas

批量查找 NFA 信息。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| nfaIds | number[] | NFA ID 数组 |

## 返回值

返回 NFA 对象数组。每个对象包含 NFA 的详细信息。

## 示例

```ts
const nfas = await client.baiyujing.findNfas([1, 2, 3])
```
