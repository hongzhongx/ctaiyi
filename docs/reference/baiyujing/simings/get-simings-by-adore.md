# getSimingsByAdore

获取指定崇拜值的司命列表。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| adore | number | 崇拜值 |
| from | number | 起始索引（可选） |
| limit | number | 返回的最大数量（可选，默认: 100） |

## 返回值

返回指定崇拜值的司命对象数组。

## 示例

```ts
const simings = await client.baiyujing.getSimingsByAdore(100, { limit: 10 })
```
