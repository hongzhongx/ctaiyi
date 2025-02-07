# listActorsBelowHealth

获取健康值低于指定值的角色列表。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| health | number | 健康值阈值 |
| from | number | 起始索引（可选） |
| limit | number | 返回的最大数量（可选，默认: 100） |

## 返回值

返回健康值低于指定值的角色对象数组。

## 示例

```ts
const actors = await client.baiyujing.listActorsBelowHealth(80, { limit: 10 })
```
