# getQiDelegations

获取账户的气力委托信息。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| account | string | 账户名 |

## 返回值

返回气力委托信息数组，包含委托人、被委托人、委托数量等信息。

## 示例

```ts
const delegations = await client.baiyujing.getQiDelegations('alice')
```
