import EntitySet from './entitySet'
import EntityContext from './entityContext'
import primary from './annotations/property/primary'
import foreign from './annotations/property/foreign'
import member from './annotations/property/member'
import behavior from './annotations/object/behavior'
import navigator from './annotations/property/navigator'
import Relationship from './annotations/relationship'

describe('EntitySet', () => {
  const toPrimaryKeys = (id: number) => ({
    condition: { id }
  })
  const toParameter = (condition: {}, pageIndex: number, pageSize: number) => ({
    condition: {
      ...condition
    },
    page: {
      index: pageIndex,
      pageSize: pageSize
    }
  })
  const toResult = (response: { data: [] }) => response.data

  @behavior('loadAll', '/bars', 'POST', toParameter, toResult)
  @behavior('load', '/bars/:id', 'GET', toPrimaryKeys, toResult)
  class Bar {
    @primary()
    @member()
    id: number = 0

    @primary()
    @member()
    name: string = ''
  }

  @behavior('loadAll', '/jars', 'POST', toParameter, toResult)
  @behavior('load', '/jars/:id', 'GET', toPrimaryKeys, toResult)
  class Jar {
    @primary()
    @member()
    id: number = 0

    @member()
    name: string = ''
  }

  @behavior('loadAll', '/foo', 'POST', toParameter, toResult)
  @behavior('load', '/foo/:id', 'GET', toPrimaryKeys, toResult)
  class Foo {
    @primary()
    @member()
    id: number = 0

    @member()
    name: string = ''

    @foreign(Bar, 'bar', 'id')
    @member()
    bid: number = 0

    @foreign(Bar, 'bar', 'name')
    @member()
    bName: string = ''

    @foreign(Jar, 'jar')
    @member()
    jid: number[] = []

    // 导航属性
    @navigator(Relationship.One, 'bar')
    bar?: Bar

    // 导航属性
    @navigator(Relationship.Many, 'jar')
    jar?: Jar[]
  }

  class Context extends EntityContext {
    foo: EntitySet<Foo> = new EntitySet<Foo>(this, Foo)
    bar: EntitySet<Bar> = new EntitySet<Bar>(this, Bar)
    jar: EntitySet<Jar> = new EntitySet<Jar>(this, Jar)
  }

  const ctx = new Context()

  beforeEach(() => {
    const foo1 = new Foo()
    foo1.id = 1
    foo1.name = 'fa1'
    foo1.bid = 1
    foo1.bName = 'ba1'
    foo1.jid = [1, 2]
    const foo2 = new Foo()
    foo2.id = 2
    foo2.name = 'fa2'
    foo2.bid = 2
    foo2.bName = 'ba2'
    foo2.jid = [3]
    const foo3 = new Foo()
    foo3.id = 3
    foo3.name = 'fa3'
    foo3.bid = 3
    foo3.bName = 'ba3'

    ctx.foo.add(foo1)
    ctx.foo.add(foo2)
    ctx.foo.add(foo3)

    const bar1 = new Bar()
    bar1.id = 1
    bar1.name = 'ba1'
    const bar2 = new Bar()
    bar2.id = 2
    bar2.name = 'ba2'

    ctx.bar.add(bar1)
    ctx.bar.add(bar2)

    const jar1 = new Jar()
    jar1.id = 1
    jar1.name = 'ja1'
    const jar2 = new Jar()
    jar2.id = 2
    jar2.name = 'ja2'
    const jar3 = new Jar()
    jar3.id = 3
    jar3.name = 'ja3'

    ctx.jar.add(jar1)
    ctx.jar.add(jar2)
    ctx.jar.add(jar3)
  })

  afterEach(() => {
    ctx.foo.clear()
    ctx.bar.clear()
    ctx.jar.clear()
  })

  it('context', () => {
    expect(ctx.foo).toHaveProperty('ctx')
    expect(ctx.bar).toHaveProperty('ctx')
  })

  it('entityMetadata', () => {
    expect(ctx.foo).toHaveProperty('entityMetadata')
    expect(ctx.foo).not.toBeUndefined()
    expect(ctx.bar).toHaveProperty('entityMetadata')
    expect(ctx.bar).not.toBeUndefined()
  })

  it('size', () => {
    expect(ctx.foo).toHaveProperty('size', 3)
  })

  it('find', () => {
    const id = 2
    const foo = ctx.foo.find(id)

    expect(foo).not.toBeUndefined()
    expect(foo).toHaveProperty('id', id)

    const undefinedFoo = ctx.foo.find(5)
    expect(undefinedFoo).toBeUndefined()
  })

  it('findAll', () => {
    const fooList = ctx.foo.findAll(n => n.id === 1 || n.id === 2)
    expect(fooList).toHaveLength(2)
  })

  it('add', () => {
    const foo = new Foo()
    foo.id = 999
    ctx.foo.add(foo)

    expect(ctx.foo).toHaveProperty('size', 4)
  })

  it('remove', () => {
    const foo = ctx.foo.find(3)
    ctx.foo.remove(foo)
    expect(ctx.foo).toHaveProperty('size', 3)

    ctx.foo.remove(foo)
    expect(ctx.foo).toHaveProperty('size', 3)

    const otherFoo = new Foo()
    otherFoo.id = 2
    ctx.foo.remove(otherFoo)
    ctx.foo.remove()
    expect(ctx.foo).toHaveProperty('size', 3)
  })

  it('attach', () => {
    const foo = new Foo()
    foo.id = 5

    ctx.foo.attach(foo)
    expect(ctx.foo).toHaveProperty('size', 4)

    const otherFoo = ctx.foo.find(5)
    expect(otherFoo).toHaveProperty('id', 5)
  })

  it('detach', () => {
    const foo = ctx.foo.find(1)
    ctx.foo.detach(foo)

    expect(ctx.foo).toHaveProperty('size', 3)

    const otherFoo = new Foo()
    otherFoo.id = 999

    ctx.foo.detach(otherFoo)
    ctx.foo.detach()
    expect(ctx.foo).toHaveProperty('size', 3)
  })

  it('toList', () => {
    const foo = ctx.foo.toList()
    expect(foo).toHaveLength(3)
  })

  it('load', async () => {
    await ctx.foo.load()

    const result = await ctx.foo.load(1)
    expect(result).toHaveProperty(['id'], 1)
  })

  it('loadAll', async () => {
    await ctx.foo.loadAll()

    const result = await ctx.foo.loadAll(1, 1, 10)
    expect(result).toHaveProperty(['0', 'id'], 1)
  })

  it('include', async () => {
    await ctx.foo.include('bar').load(1)
    // await ctx.foo.include('jar').loadAll()
    // await ctx.foo.include('bar').include('jar').loadAll()
    ctx.foo.find(1)
  })

  it('rawFetch', () => {})
})
