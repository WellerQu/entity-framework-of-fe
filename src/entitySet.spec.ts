import EntitySet from './entitySet'
import EntityContext from './entityContext'
import primary from './annotations/property/primary'
import foreign from './annotations/property/foreign'
import member from './annotations/property/member'
import behavior from './annotations/object/behavior'
import navigator from './annotations/property/navigator'
import Relationships from './constants/relationship'
import EntityConfiguration from './entityConfiguration'
import set from './annotations/property/set'
import constraint from './annotations/property/constraint'
import Constraints from './constants/constraints'

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

    @navigator(Relationships.One, 'zar')
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

  class Bdr {
    @member()
    id: number = 0

    @member('bname')
    name: string = ''
  }

  class Jfu {
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
    @navigator(Relationships.One, 'bar')
    bar?: Bar

    // 导航属性
    @navigator(Relationships.Many, 'jar-alias')
    jar?: Jar[]

    @member()
    @constraint(Constraints.READ_ONLY)
    createTime: number = 0
  }

  class Kan {
    @primary()
    @member()
    id: number = 0

    @member('url_fully')
    urlFully: string = ''
  }

  class Fna {
    @member(undefined, Bdr)
    bdr: Partial<Bdr> = {}
    @member(undefined, Jfu)
    jfu: Partial<Jfu>[] = []
    @member()
    pao: string[] = []
    @member()
    id: number = 1
  }

  class Configuration extends EntityConfiguration {
    public fetch<T = any> (url: string, options?: RequestInit | undefined): Promise<T> {
      return require('node-fetch')(url, options)
    }
  }

  class Context extends EntityContext {
    constructor () {
      super(new Configuration())
    }

    @set()
    foo: EntitySet<Foo> = new EntitySet<Foo>(this, Foo)
    @set()
    bar: EntitySet<Bar> = new EntitySet<Bar>(this, Bar)
    @set('jar-alias')
    jar: EntitySet<Jar> = new EntitySet<Jar>(this, Jar)
    @set()
    zar: EntitySet<Zar> = new EntitySet<Zar>(this, Zar)
    @set()
    kan: EntitySet<Kan> = new EntitySet<Kan>(this, Kan)
    @set()
    fna: EntitySet<Fna> = new EntitySet<Fna>(this, Fna)
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
      expect(zar).not.toBe(originData)

      const newZar = new Zar()
      const zar2 = ctx.zar.entry(originData, newZar)
      expect(zar2).toBe(newZar)
      expect(zar2.id).toEqual(newZar.id)
    })

    it('entry complex data', () => {
      const fna = {
        bdr: {
          id: 1,
          bname: 'bar name'
        },
        jfu: [{
          id: 1,
          name: 'jaz name 1'
        }, {
          id: 2,
          name: 'jaz name 2'
        }],
        pao: ['1', '2']
      }

      const en1 = ctx.fna.entry(fna)
      expect(en1).toBeDefined()
      expect(en1).toBeInstanceOf(Fna)

      expect(en1.bdr).toBeDefined()
      expect(en1.bdr!.id).toEqual(fna.bdr.id)
      expect(en1.bdr!.name).toEqual(fna.bdr.bname)

      expect(en1.jfu).toBeDefined()
      expect(en1.jfu).toHaveLength(2)
      expect(en1.jfu![0]).toEqual(fna.jfu[0])
      expect(en1.jfu![1]).toEqual(fna.jfu[1])

      expect(en1.pao).toBe(fna.pao)

      const en2 = new Fna()
      ctx.fna.entry(fna, en2)
      expect(en2.bdr).toBeDefined()
      expect(en2.bdr!.id).toEqual(fna.bdr.id)
      expect(en2.bdr!.name).toEqual(fna.bdr.bname)

      expect(en2.jfu).toBeDefined()
      expect(en2.jfu).toHaveLength(2)
      expect(en2.jfu![0]).toEqual(fna.jfu[0])
      expect(en2.jfu![1]).toEqual(fna.jfu[1])

      expect(en2.pao).toBe(fna.pao)
    })

    it('fill', () => {
      const originData = { id: 1, urlFully: 'hahaha.com' }

      const kan = ctx.kan.fill(originData)
      expect(kan.urlFully).toEqual(originData.urlFully)

      const newKan = new Kan()
      const kan2 = ctx.kan.fill(originData, newKan)
      expect(kan2).toBe(newKan)
      expect(kan2.urlFully).toEqual(newKan.urlFully)
    })

    it('fill complex data', () => {
      const fna = {
        bdr: {
          id: 1,
          name: 'bar name'
        },
        jfu: [{
          id: 1,
          name: 'jaz name 1'
        }, {
          id: 2,
          name: 'jaz name 2'
        }],
        pao: ['1', '2']
      }

      const en1 = ctx.fna.fill(fna)
      expect(en1).toBeDefined()
      expect(en1).toBeInstanceOf(Fna)

      expect(en1.bdr).toBeDefined()
      expect(en1.bdr!.id).toEqual(fna.bdr.id)
      expect(en1.bdr!.name).toEqual(fna.bdr.name)

      expect(en1.jfu).toBeDefined()
      expect(en1.jfu).toHaveLength(2)
      expect(en1.jfu![0]).toEqual(fna.jfu[0])
      expect(en1.jfu![1]).toEqual(fna.jfu[1])

      expect(en1.pao).toBe(fna.pao)

      const en2 = new Fna()
      ctx.fna.fill(fna, en2)
      expect(en2.bdr).toBeDefined()
      expect(en2.bdr!.id).toEqual(fna.bdr.id)
      expect(en2.bdr!.name).toEqual(fna.bdr.name)

      expect(en2.jfu).toBeDefined()
      expect(en2.jfu).toHaveLength(2)
      expect(en2.jfu![0]).toEqual(fna.jfu[0])
      expect(en2.jfu![1]).toEqual(fna.jfu[1])

      expect(en2.pao).toBe(fna.pao)
    })

    it('reverse', () => {
      const kan = new Kan()
      kan.id = 2
      kan.urlFully = 'hualala.com'

      const originData = ctx.kan.reverse(kan)
      expect(originData.url_fully).toEqual(kan.urlFully)
      expect(originData).not.toBe(kan)
    })

    it('reverse complex data', () => {
      const fna = new Fna()
      fna.bdr.id = 1
      fna.bdr.name = 'bdr name'
      fna.id = 1

      const jfu = new Jfu()
      jfu.id = 1
      jfu.name = 'jfu name'
      fna.jfu.push(jfu)

      fna.pao = ['a', 'b']

      const originData = ctx.fna.reverse(fna)
      expect(originData).toBeDefined()
      expect(originData.bdr.id).toEqual(fna.bdr.id)
      expect(originData.bdr.bname).toEqual(fna.bdr.name)

      expect(originData.jfu).toBeDefined()
      expect(originData.jfu).toHaveLength(1)
      expect(originData.jfu![0]).toEqual(fna.jfu[0])

      expect(originData.pao).toBe(fna.pao)
    })
  })

  describe('apply constraints', () => {
    beforeEach(() => {
      const foo = new Foo()
      foo.id = 1
      foo.name = 'Hello'
      foo.createTime = 123467

      ctx.clean().foo.attach(foo)
    })

    it('modify readonly member will get a exception', () => {
      const foo = ctx.foo.find(1)
      // expect(() => { foo!.createTime = 2 }).toThrow('无法修改一个添加了READ_ONLY约束的成员')
      foo!.createTime = 2
      expect(foo!.createTime).toEqual(123467)
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
