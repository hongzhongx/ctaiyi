# getTransactionResults

获取交易执行结果。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| transactionId | string | 交易 ID |

## 返回值

返回交易执行结果对象，包含执行状态、日志等信息。

## 示例

```ts
const results = await client.baiyujing.getTransactionResults('abcd1234...')
```
