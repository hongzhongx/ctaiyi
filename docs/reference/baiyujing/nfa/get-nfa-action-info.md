# getNfaActionInfo

获取 NFA 动作的详细信息。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| nfaId | number | NFA ID |
| actionName | string | 动作名称 |

## 返回值

返回 NFA 动作的详细信息对象，包含动作的参数、效果等信息。

## 示例

```ts
const actionInfo = await client.baiyujing.getNfaActionInfo(1, 'attack')
```
