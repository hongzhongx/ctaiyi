# findWayToZone

查找到达目标区域的路径。

## 参数

| 名称 | 类型 | 描述 |
|------|------|------|
| fromZoneId | number | 起始区域 ID |
| toZoneId | number | 目标区域 ID |

## 返回值

返回路径对象数组，表示从起始区域到目标区域的可行路径。

## 示例

```ts
const path = await client.baiyujing.findWayToZone(1, 2)
```
