# lookupAccounts

按前缀搜索账户名。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| lowerBoundName | string | 账户名搜索的下界（前缀） |
| limit | number | 返回的最大数量（可选，默认: 100） |

## 返回值

返回匹配前缀的账户名数组。

## 示例

```ts
const accounts = await client.baiyujing.lookupAccounts('ali', 10)
```
