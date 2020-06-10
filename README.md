# Entity Framework

![CI status](https://github.com/WellerQu/entity-framework-of-fe/workflows/Node%20CI/badge.svg)

## 基本用法

设: 原始数据模型 OriginModel, 如下所示

```typescript
const originFoo = { a: 1, b: "2", c: { d: { e: 2 } } }
```

创建对应的实体数据模型 EntityModel, 并描述关系

```typescript
import { member, mapping } from 'entity-framework'

class Foo {
  @member()
  a: number = 0

  @member()
  b: string = "b"

  @member('e')
  @mapping("c.d")
  d: number = 0
}
```

创建上下文, 并在上下文中创建数据集 EntitySet

```typescript
import { EntityContext } from 'entity-framework'

class Context extends EntityContext {
  fooSet = new EntitySet<Foo>(Foo)
}
```

序列化: 将实体数据模型(EntityModel)的实例转换成原始数据模型(OriginModel)的实例

```typescript
const foo = new Foo()
foo.a = 1
foo.b = "b"
foo.d = 2

const ctx = new Context()
const origin = ctx.fooSet.serialize(foo)

expect(origin).toInstanceOf(Object)
expect(origin.a).toEquals(foo.a)
expect(origin.b).toEquals(foo.b)
expect(origin.c.d).toEquals(foo.d)
```

反序列化: 将原始数据模型(OriginModal)的实例转换成实体数据模型(EntityModel)的实例

```typescript
const originData = originFoo

const ctx = new Context()
const foo = ctx.fooSet.deserialize(originData)

expect(foo).toInstanceOf(Foo)
expect(foo.a).toEquals(originData.a)
expect(foo.b).toEquals(originData.b)
expect(foo.d).toEquals(originData.c.d)
```

## 概念介绍

- 原始数据模型
- 实体数据模型
- 数据集
- 序列化
- 反序列化

## 未来计划
