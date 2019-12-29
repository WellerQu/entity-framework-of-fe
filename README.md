# Entity Framework Of Frontend

![CI status](https://github.com/WellerQu/entity-framework-of-fe/workflows/Node%20CI/badge.svg)

用于前端的实体关系框架, 解决存在关联关系的实体之间的CRUD

- [API Guide](https://wellerqu.github.io/entity-framework-of-fe/)

- [Github](https://github.com/WellerQu/entity-framework-of-fe)

- [概念](https://github.com/WellerQu/entity-framework-of-fe#%E6%A6%82%E5%BF%B5)

- [用法](https://github.com/WellerQu/entity-framework-of-fe#%E7%94%A8%E6%B3%95)

## 概念

### 定义实体模型

实体是用于描述一种数据的数据结构, 实体的实例在Entity Framework(以后简称为EF)中定义成**一个class的实例, 而非原生的JSON数据**, 例如:

```typescript
// Wrong ❌
const foo = { id: 1, name: 'foo' }

// Right ✅
class Foo {
  id: number
  name: string
}

const foo = new Foo()
```

### 描述实体模型

EF中, 采用注解来描述代表实体数据结构的class, 目前一共有二类注解

- 类注解

  ```typescript
  @behavior('load', `${domain}/foo/$id`, 'GET')
  class Foo {
    // define ...
  }
  ```

  - @behavior() 用于注解实体拥有的行为, 在调用相关方法时, 会触发这些行为

  > 完整签名查看源代码 src/annotations/object/behavior.ts

  ```typescript
  @behavior('load', `http://localhost:3000/foo/$id`, 'GET')
  class Foo {
    @primary()
    id: number
  }

  const ctx = new Context()
  // 加载主键为1的Foo的数据
  await ctx.foo.load(1)
  // 在调用load方法时, 会向 http://localhost:3000/foo/$id 发起 GET 请求, 并在请求前将 $id 替换为 1
  ```

- 属性注解

  ```typescript
  class Bar {
    // define ...
  }

  class Foo {
    @primary()
    id: number

    @member()
    name: string

    @foreign(Bar, 'bar')
    bid: number

    @navigator(Relationship.One, 'bar')
    bar?: Bar
  }
  ```

  - @primary() 用于注解实体的主键, 实体的主键可以由多个主键组成组合键, 主键用于查询数据

  > 完整签名查看源代码 src/annotations/property/primary.ts

  - @member() 用于注解实体的各个成员字段, 被标记为@member的成员字段将会被持久化

  > 完整签名查看源代码 src/annotations/property/member.ts

  - @foreign() 用于注解实体的外键, 当前实体的外键一定是另一个实体的主键, 如果另一个实体有多个主键, 那么当前也需要对应的有多个外键

  > 完整签名查看源代码 src/annotations/property/foreign.ts

  - @navigator() 用于注解实体的导航数据, 在通过外键读取到相关数据后, EF会将相关数据的引用存储在导航属性中, **导航属性只需要声明, 不需要初始化**,

  > 完整签名查看源代码 src/annotations/property/navigator.ts

### 关联实体模型

参考数据库设计, 可以用主外键来描述, 并部署相关的导航属性, 其中导航名称(navigatorName)是很重要的一个数据, 用来**联系@set(), @foreign(), @navigator()标记的数据**, 代码标记\[1\]\[2\]\[3\]处须一致

```typescript
class Bar {
  @primary()
  id: number = 0
}

class Haz {
  @primary()
  id: number = 0
}

class Foo {
  @primary()
  id: number = 0

  // Foo 与 Bar 是一对一关联
  @foreign(Bar, 'bar-navigatorName') // <- [1]
  bid: number = 0

  // Foo 与 Haz 是一对多关联
  @foreign(Haz, 'haz')
  hid: number[] = [0]

  @navigator(Relationship.One, 'bar-navigatorName') // <- [2]
  bar?: Bar

  @navigator(Relationship.Many, 'haz')
  haz?: Haz[]
}

class Context extends EntityContext {
  @set('bar-navigatorName') // <- [3]
  bar = new EntitySet<Bar>(this, Bar)
}
```

### EntitySet 与 EntityContext

- EntitySet 是用来存储实体的容器, 内部用Set来存储数据, **EntitySet字段的名称就是导航名称(navigatorName)**

- EntityContext 是用来界定相关数据范围的

  ```typescript
  // 定义一个 Context
  class MyContext extends EntityContext {
    @set()
    foo = new EntitySet<Foo>(this, Foo)
    @set()
    bar = new EntitySet<Bar>(this, Bar)
    @set()
    haz = new EntitySet<Haz>(this, Haz)
  }

  // 实例化 EntityContext
  const ctx = new MyContext()
  ```

### 加载数据

加载数据是对数据进行各种操作的前提, 加载数据有二种方式, 用于应对二种情况

```typescript
@behavior('load', 'http://localhost:3000/foo/$pk', 'GET')
@behavior('loadAll', 'http://localhost:3000/foo', 'GET')
class Foo {
  // define ...
}
```

- Load 通过定义的主键(或者组合键)唯一实体数据, 需要先部署Load behavior

  ```typescript
  // 加载只有一个主键的数据
  // http://localhost:3000/foo/$pk -> http://localhost:3000/foo/1
  await ctx.foo.load(1)
  // 加载部署了组合键的数据
  // http://localhost:3000/foo/$pk1/$pk2 -> http://localhost:3000/foo/1/2
  // 参数顺序为描述模型中@primary标记的顺序
  await ctx.foo.load(1, 2)
  ```

- LoadAll 通过传入的条件加载所有符合条件的数据

  ```typescript
  // 加载符合条件的所有数据
  await ctx.foo.loadAll({
    // anything
  })
  ```

- 加载数据的副作用

  每一次Load或者LoadAll, 都会在不清除上一次加载的数据的情况下, 添加新的数据, 如果不想被上一次的数据干扰, 可以使用**clean**方法

  ```typescript
  const ctx = new YourContext()
  await ctx.foo.load(1)
  await ctx.foo.load(1)

  // 此时ctx.foo.size 为 2, 因为加载了二次

  ctx.clean()
  // 此时ctx.foo.size 为 1, 清除了之前加载的数据

  // 或者每次加载之前执行 clean
  await ctx.clean().foo.load(1)
  ```

**查询参数到RequestBody的映射** 与 **ResponseBody到实体数据的映射**, 参见@behavior注解的mapParameters和mapEntity参数

> 完整源代码参见 src/entitySet.ts

- include 加载关联的数据, **在loadAll或者load一对多关系的实体时, 慎重使用include**

```typescript
// 在加载主键为 1 的Foo的数据时, 将与Foo相关的Bar的数据也一并加载, 若Foo与Bar为一对一关系, EF会发起二个请求, 在Foo请求正确完成之后, 再发起对Bar的请求
await ctx.foo.include('bar').load(1)

// 在加载完符合条件的Foo数据后, 将与Foo相关的Bar的数据也一并加载, 若Foo存在十条数据, 且Foo与Bar为一对一关系, EF会再并行发送十个请求, 用于加载对应的Bar数据
await ctx.foo.include('bar').loadAll()
```

- rawFetch 使用任意方法发起加载数据的请求, 并结果存储在EntitySet中, **忽略include**

```typescript
await ctx.foo.rawFetch(() => window.fetch('/bar').then(res => res.json()))
```

### 查询数据

在EF完成对数据的加载后, 就可以直接查询数据, 查询数据有二种方式, 分别应对二种情况

- find 通过主键(或组合键)查询唯一数据

```typescript
const foo: Foo = ctx.foo.find(1)
// or
const foo: Foo = ctx.foo.find(1, 2)
```

- filter 通过filterCallback函数过滤数据

```typescript
const foo: Foo[] = ctx.foo.filter((n) => n.id === 1 || n.id === 2)
```

### 添加数据 / 修改数据 / 删除数据

- saveChanges 将对EntitySet的修改同步到服务端. EF的Context会搜集数据集中各个元素的状态, saveChanges方法被调用时, 会检查这些状态的变更, 并对Added, Deleted, Modified做出反应, 尝试调用定义的@behavior来与服务端同步. **被remove后的数据, 不可以再以任何形式读写**.

```typescript
// Add entity
const newFoo = new Foo()
// newFoo 赋值
ctx.foo.add(newFoo)
// 将调用@behavior('add', 'http://localhost:3000/foo', 'POST')定义的行为
const res: Promise<Response[]> = await ctx.saveChanges()
// 检查res

// Update entity
const foo = ctx.foo.find(1)
// 只可以更新非主键成员字段
foo.name = 'Hello'
// 将调用@behavior('update', 'http://localhost:3000/foo', 'POST')定义的行为
ctx.saveChanges()

// Delete entity
const foo1 = ctx.foo.find(1)
const foo2 = ctx.foo.find(2)
ctx.remove(foo1, foo2)
// 将调用@behavior('delete', 'http://localhost:3000/foo', 'POST')定义的行为
ctx.saveChanges()

// CRUD the Included entity
await ctx.foo.include('bar').load(1)
const foo = ctx.foo.find(1)
foo.bar.name = 'World'
// 将调用@behavior('update', 'http://localhost:3000/bar', 'POST')定义的行为
ctx.saveChanges()

await ctx.foo.include('bar').load(1)
const foo = ctx.foo.find(1)
ctx.bar.remove(foo.bar)
// 将调用@behavior('delete', 'http://localhost:3000/bar', 'POST')定义的行为
ctx.saveChanges()

await ctx.foo.include('jar').load(1)
const foo = ctx.foo.find(1)
// 若一个foo关联了二个jar, 那么ctx中将会有三个实体实例被标记为deleted, saveChanges会发出三个请求
ctx.foo.remove(foo)
ctx.saveChange()
```

### 处理错误

- 加载数据时的部分错误(比如关联查询错误)被消化在Promise中, 并未全部都传递到调用端, 调用端无法捕获正确的错误信息
- saveChanges时的错误能传递到调用端

```typescript
const foo1 = new Foo()
const foo2 = new Foo()
// newFoo 赋值
ctx.foo.add(foo1, foo2)
// 将调用@behavior('add', 'http://localhost:3000/foo', 'POST')定义的行为二次
const res: Promise<Response[]> = await ctx.saveChanges()
// res的Promise中将得到一个数组, 即二次请求的结果
// 检查res数据, 以确定每一个请求是否都正确完成
```

## 用法

[参见测试用例](https://github.com/WellerQu/entity-framework-of-fe/blob/master/src/index.spec.ts)

## TODO

- [ ] 补充关键代码注释
- [ ] 更精确的错误信息传递
- [ ] 数据缓存降低数据加载时对服务器的压力
- [x] 更多场景的测试用例
