import EntitySet from './entitySet'
import EntityContext from './entityContext'
import primary from './annotations/property/primary'
import foreign from './annotations/property/foreign'
import member from './annotations/property/member'
import behavior from './annotations/object/behavior'
import navigator from './annotations/property/navigator'
import Relationship from './annotations/relationship'
import EntityConfiguration from './entityConfiguration'
import set from './annotations/property/set'

describe('EntitySet', () => {
  const domain = 'http://localhost:3000'

  @behavior('loadAll', `${domain}/zar`, 'GET', a => a, a => a)
  @behavior('load', `${domain}/zar/$id`, 'GET', a => a, a => a)
  class Zar {
    @primary()
    @member()
    id: number = 0

    @member('zAliasName')
    name: string = ''
  }

  @behavior('loadAll', `${domain}/bar`, 'GET', a => a, a => a)
  @behavior('load', `${domain}/bar/$id`, 'GET', a => a, a => a)
  class Bar {
    @primary()
    @member()
    id: number = 0

    @primary()
    @member()
    name: string = ''

    @foreign(Zar, 'zar')
    @member()
    zid: number = 0

    @navigator(Relationship.One, 'zar')
    zar?: Zar
  }

  @behavior('loadAll', `${domain}/jar`, 'GET', a => a, a => a)
  @behavior('load', `${domain}/jar/$id`, 'GET', a => a, a => a)
  class Jar {
    @primary()
    @member()
    id: number = 0

    @member()
    name: string = ''
  }

  const mapParameters = (entity: Foo) => {
    if (entity.id === 0) {
      delete entity.id
    }

    return entity
  }

  const mapEntity = (response: Response) => response.json()

  @behavior('loadAll', `${domain}/foo`, 'GET', a => a, a => a)
  @behavior('load', `${domain}/foo/$id`, 'GET', a => a, a => a)
  @behavior('add', `${domain}/foo`, 'POST', mapParameters, mapEntity)
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

    @foreign(Jar, 'jar-alias')
    @member()
    jid: number[] = []

    // 导航属性
    @navigator(Relationship.One, 'bar')
    bar?: Bar

    // 导航属性
    @navigator(Relationship.Many, 'jar-alias')
    jar?: Jar[]
  }

  class Context extends EntityContext {
    constructor () {
      super(new EntityConfiguration())
    }

    @set()
    foo: EntitySet<Foo> = new EntitySet<Foo>(this, Foo)
    @set()
    bar: EntitySet<Bar> = new EntitySet<Bar>(this, Bar)
    @set('jar-alias')
    jar: EntitySet<Jar> = new EntitySet<Jar>(this, Jar)
    @set()
    zar: EntitySet<Zar> = new EntitySet<Zar>(this, Zar)
  }

  const ctx = new Context()

  describe('query local data', () => {
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

      foo1.bar = ctx.bar.find(1, 'ba1')

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

      foo1.jar = ctx.jar.filter(item => item.id === 1 || item.id === 2)
    })

    afterEach(() => {
      ctx.foo.clean()
      ctx.bar.clean()
      ctx.jar.clean()
      ctx.zar.clean()
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

    it('filter', () => {
      const fooList = ctx.foo.filter(n => n.id === 1 || n.id === 2)
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
      expect(ctx.foo.size).toEqual(2)

      ctx.foo.remove(foo)
      expect(ctx.foo.size).toEqual(2)

      const otherFoo = new Foo()
      otherFoo.id = 2
      ctx.foo.remove(otherFoo)
      ctx.foo.remove()
      expect(ctx.foo.size).toEqual(2)
    })

    it('remove with included key', () => {
      const foo = ctx.foo.find(1)
      ctx.foo.remove(foo)

      // before: size is 3
      expect(ctx.foo.size).toEqual(2)
      // before: size is 2
      expect(ctx.bar.size).toEqual(1)
      // before: size is 3
      expect(ctx.jar.size).toEqual(1)
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

      expect(ctx.foo.size).toEqual(2)

      expect(() => {
        ctx.foo.attach(foo)
      }).toThrowError(/Cannot create proxy with a revoked proxy as target or handler/)

      const otherFoo = new Foo()
      otherFoo.id = 999

      ctx.foo.detach(otherFoo)
      ctx.foo.detach()
      expect(ctx.foo.size).toEqual(2)
    })

    it('toList', () => {
      const foo = ctx.foo.toList()
      expect(foo).toHaveLength(3)
    })

    it('change property', () => {
      const foo = ctx.foo.find(1)
      foo!.name = 'fuck off'
      expect(foo!.name).toEqual('fuck off')

      ctx.foo.remove(foo)
      expect(() => {
        foo!.name = 'asshole'
      }).toThrowError(/has been revoked/)
    })

    it('entry', () => {
      const originData = {
        id: 1,
        zAliasName: 'ZarName'
      }

      const zar = ctx.zar.entry(originData)
      expect(zar.id).toEqual(originData.id)
      expect(zar.name).toEqual(originData.zAliasName)
    })
  })

  describe('query remote data', () => {
    afterEach(() => {
      ctx.foo.clean()
      ctx.bar.clean()
      ctx.jar.clean()
      ctx.zar.clean()
    })

    it('load', async () => {
      await ctx.foo.load(1)
      const foo = ctx.foo.find(1)
      expect(foo).toHaveProperty(['id'], 1)
    })

    it('include: one to one', async () => {
      await ctx.foo.include('bar').load(1)
      const foo = ctx.foo.find(1)
      expect(foo).not.toBeUndefined()
      expect(foo).toHaveProperty('bar')
      expect(foo!.bar).toHaveProperty('id', 1)
      expect(foo!.bar!).not.toHaveProperty('age')
    })

    it('include: one to many', async () => {
      await ctx.foo.include('jar-alias').load(1)
      const foo = ctx.foo.find(1)
      expect(foo).not.toBeUndefined()
      expect(foo).toHaveProperty('jar')
      expect(foo!.jar).toHaveLength(2)
      expect(ctx.jar.size).toEqual(2)
    })

    it('include: more fields', async () => {
      await ctx.foo.include('bar').include('jar-alias').load(1)
      const foo = ctx.foo.find(1)
      expect(foo).not.toBeUndefined()
      expect(foo).toHaveProperty('bar')
      expect(foo!.bar).toHaveProperty('id', 1)
      expect(foo).not.toBeUndefined()
      expect(foo).toHaveProperty('jar')
      expect(foo!.jar).toHaveLength(2)
    })

    it('include: load more levels', async () => {
      await ctx.foo.include('bar').include('zar').load(1)

      const foo = ctx.foo.find(1)
      expect(foo).not.toBeUndefined()
      expect(foo).toHaveProperty('bar')
      expect(foo!.bar).toHaveProperty('id', 1)
      expect(foo!.bar!.zar).not.toBeUndefined()
      expect(foo).toHaveProperty(['bar', 'zar', 'id'], 1)
    })

    it('include: load more levels and fields', async () => {
      await ctx.foo.include('bar').include('jar-alias').include('zar').load(1)

      const foo = ctx.foo.find(1)
      expect(foo).not.toBeUndefined()
      expect(foo).toHaveProperty('bar')
      expect(foo!.bar).toHaveProperty('id', 1)
      expect(foo!.bar!.zar).not.toBeUndefined()
      expect(foo).toHaveProperty(['bar', 'zar', 'id'], 1)

      expect(foo).toHaveProperty('jar')
      expect(foo!.jar).not.toBeUndefined()
      expect(foo!.jar).toHaveLength(2)
    })

    it('loadAll: load all entity', async () => {
      await ctx.foo.loadAll()
      const foo = ctx.foo.find(1)
      expect(foo).not.toBeUndefined()
    })

    it('loadAll: include jar key', async () => {
      await ctx.foo.include('jar-alias').loadAll()
      const case2 = ctx.foo.find(1)
      expect(case2).toHaveProperty('jar')
      expect(case2!.jar).not.toBeUndefined()
      expect(case2!.jar).toHaveLength(2)
    })

    it('loadAll: include bar key', async () => {
      await ctx.foo.include('bar').loadAll()
      const case1 = ctx.foo.find(1)
      expect(case1).toHaveProperty('bar')
      expect(case1!.bar).not.toBeUndefined()
    })

    it('loadAll: include two keys', async () => {
      await ctx.foo.include('bar').include('jar-alias').loadAll()
      const foo = ctx.foo.find(1)
      expect(foo).toHaveProperty('id', 1)

      expect(foo!.jar).not.toBeUndefined()
      expect(foo!.jar).toHaveLength(2)

      expect(foo!.bar).not.toBeUndefined()
    })

    it('loadAll: include more levels', async () => {
      await ctx.foo.include('bar').include('jar-alias').include('zar').loadAll()
      const foo = ctx.foo.find(1)
      expect(foo).toHaveProperty('id', 1)

      expect(foo!.jar).not.toBeUndefined()
      expect(foo!.jar).toHaveLength(2)

      expect(foo!.bar).not.toBeUndefined()
      expect(foo!.bar!.zar).not.toBeUndefined()
    })

    it('rawFetch', () => {
      const foo = new Foo()
      foo.id = 2
      foo.name = 'Hello World'

      return expect(ctx.foo.rawFetch(() => {
        return Promise.resolve([foo])
      })).resolves.toStrictEqual([ foo ])
    })
  })

  describe('save changes', () => {
    beforeEach(() => {
      const foo = new Foo()
      foo.id = 1
      foo.name = 'Hello'

      ctx.foo.attach(foo)
    })

    it('synchronizeState: UnChanged', () => {
      return expect(ctx.saveChanges()).resolves.toStrictEqual([])
    })

    it.skip('synchronizeState: Add', () => {
      const foo = new Foo()
      foo.name = 'World'

      ctx.foo.add(foo)

      return expect(ctx.saveChanges()).resolves.toStrictEqual([{ id: 2, name: 'World' }])
    })

    it.skip('synchronizeState: Update', async () => {
      await ctx.foo.load(1)
      const case1 = ctx.foo.find(1)
      case1!.name = 'Hoha'

      return expect(ctx.saveChanges()).resolves.toStrictEqual([])
    })

    it.skip('synchronizeState: Update', async () => {
      await ctx.foo.include('bar').include('zar').load(1)
      const case1 = ctx.foo.find(1)
      case1!.bar!.zar!.name = 'ooooops'

      return expect(ctx.saveChanges()).resolves.toStrictEqual([])
    })

    it.skip('synchronizeState: Delete', async () => {
      await ctx.foo.include('bar').include('zar').load(1)
      const case1 = ctx.foo.find(1)
      ctx.zar.remove(case1!.bar!.zar)

      return expect(ctx.saveChanges()).resolves.toStrictEqual([])
    })
  })
})
