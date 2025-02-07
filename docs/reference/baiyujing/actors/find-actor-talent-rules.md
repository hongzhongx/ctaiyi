# findActorTalentRules

查找角色的天赋规则。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| actorId | number | 角色 ID |

## 返回值

返回角色天赋规则对象数组。每个对象包含规则 ID、规则类型、效果等信息。

## 示例

```ts
const rules = await client.baiyujing.findActorTalentRules(1)
```
