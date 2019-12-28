import * as EF from './index'

const exec = require('child_process').exec

describe('Behavior-driven development', () => {
  if (process.env.CI !== 'Github') {
    beforeEach(() => {
      exec('git checkout server/db.json', function (err: Error) {
        if (err != null) {
          return console.error(err) // eslint-disable-line no-console
        }
      })
    })

    afterAll(() => {
      exec('git checkout server/db.json', function (err: Error) {
        if (err != null) {
          return console.error(err) // eslint-disable-line no-console
        }
      })
    })
  }

  it('query a foo by primary (id)', async () => {
    @EF.behavior('load', 'http://localhost:3000/foo/$id', 'GET')
    class Foo {
      @EF.primary()
      @EF.member()
      id: number = 0

      @EF.member('name')
      aliasName: string = ''
    }

    class Context extends EF.EntityContext {
      @EF.set()
      foo = new EF.EntitySet<Foo>(this, Foo)
    }

    const ctx = new Context()
    await ctx.foo.load(1)
    const foo = ctx.foo.find(1)

    expect(foo).toBeDefined()
    expect(foo).toHaveProperty('id', 1)
    expect(foo).toHaveProperty('aliasName', 'fa1')
    expect(foo).not.toHaveProperty('bid')
    expect(ctx.foo.size).toEqual(1)
  })

  it('query a bar by primary (id, name)', async () => {
    // json server 的filter语法: https://github.com/typicode/json-server#filter
    // 过滤出来的是一个集合, 所以需要mapEntity方法将结果取第一个元素
    @EF.behavior('load', 'http://localhost:3000/bar?id=$id&name=$name', 'GET', (...a: any[]) => a, (a: any[]) => a[0])
    class Bar {
      @EF.primary()
      @EF.member()
      id: number = 0

      @EF.primary()
      @EF.member()
      name: string = ''

      @EF.member()
      age: number = 0
    }

    class Context extends EF.EntityContext {
      @EF.set()
      bar = new EF.EntitySet<Bar>(this, Bar)
    }

    const ctx = new Context()
    await ctx.bar.load(1, 'ba1')
    const bar = ctx.bar.find(1, 'ba1')
    expect(bar).toBeDefined()
    expect(bar).toHaveProperty('id', 1)
    expect(bar).toHaveProperty('name', 'ba1')
    expect(bar).toHaveProperty('age', 13)
  })

  it('query a foo with a foreign key bar(id, name), the relationship is one to one', async () => {
    @EF.behavior('load', 'http://localhost:3000/bar?id=$id&name=$name', 'GET', (...a: any[]) => a, (a: any[]) => a[0])
    class Bar {
      @EF.primary()
      @EF.member()
      id: number = 0

      @EF.primary()
      @EF.member()
      name: string = ''

      @EF.member()
      age: number = 0
    }

    @EF.behavior('load', 'http://localhost:3000/foo/$id', 'GET')
    class Foo {
      @EF.primary()
      @EF.member()
      id: number = 0

      @EF.member('name')
      aliasName: string = ''

      @EF.foreign(Bar, 'bar', 'id')
      @EF.member()
      bid: number = 0

      @EF.foreign(Bar, 'bar', 'name')
      @EF.member()
      bName: string = ''

      @EF.navigator(EF.Relationship.One, 'bar')
      bar?: Bar
    }

    class Context extends EF.EntityContext {
      @EF.set()
      foo = new EF.EntitySet<Foo>(this, Foo)
      @EF.set()
      bar = new EF.EntitySet<Bar>(this, Bar)
    }

    const ctx = new Context()
    await ctx.foo.include('bar').load(1)
    const foo = ctx.foo.find(1)
    expect(foo).toHaveProperty('id', 1)
    expect(foo!.bar).toBeDefined()
    expect(foo!.bar).toHaveProperty('id', 1)
    expect(foo!.bar).toHaveProperty('name', 'ba1')
    expect(foo!.bar).toHaveProperty('age', 13)
    expect(ctx.foo.size).toEqual(1)
    expect(ctx.bar.size).toEqual(1)
  })

  it('query a foo with a foreign key jar(id), the relationship is one to many', async () => {
    @EF.behavior('load', 'http://localhost:3000/jar/$id', 'GET')
    class Jar {
      @EF.primary()
      @EF.member()
      id: number = 0

      @EF.member()
      name: string = ''
    }

    @EF.behavior('load', 'http://localhost:3000/foo/$id', 'GET')
    class Foo {
      @EF.primary()
      @EF.member()
      id: number = 0

      @EF.member('name')
      aliasName: string = ''

      @EF.foreign(Jar, 'jar', 'id')
      @EF.member()
      jid: number[] = []

      @EF.navigator(EF.Relationship.Many, 'jar')
      jar?: Jar[]
    }

    class Context extends EF.EntityContext {
      @EF.set()
      foo = new EF.EntitySet<Foo>(this, Foo)
      @EF.set()
      jar = new EF.EntitySet<Jar>(this, Jar)
    }

    const ctx = new Context()
    await ctx.foo.include('jar').load(1)
    const foo = ctx.foo.find(1)
    expect(foo).toHaveProperty('id', 1)
    expect(foo!.jar).toBeDefined()
    expect(foo!.jar).toHaveLength(2)
    expect(foo!.jar).toEqual([{ id: 1, name: 'ja1' }, { id: 2, name: 'ja2' }])
    expect(ctx.foo.size).toEqual(1)
    expect(ctx.jar.size).toEqual(2)
  })

  it('query a foo with two foreign keys bar(id, name) and jar(id)', async () => {
    @EF.behavior('load', 'http://localhost:3000/jar/$id', 'GET')
    class Jar {
      @EF.primary()
      @EF.member()
      id: number = 0

      @EF.member()
      name: string = ''
    }

    @EF.behavior('load', 'http://localhost:3000/bar?id=$id&name=$name', 'GET', (...a: any[]) => a, (a: any[]) => a[0])
    class Bar {
      @EF.primary()
      @EF.member()
      id: number = 0

      @EF.primary()
      @EF.member()
      name: string = ''

      @EF.member()
      age: number = 0
    }

    @EF.behavior('load', 'http://localhost:3000/foo/$id', 'GET')
    class Foo {
      @EF.primary()
      @EF.member()
      id: number = 0

      @EF.member('name')
      aliasName: string = ''

      @EF.foreign(Jar, 'jar', 'id')
      @EF.member()
      jid: number[] = []

      @EF.navigator(EF.Relationship.Many, 'jar')
      jar?: Jar[]

      @EF.foreign(Bar, 'bar', 'id')
      @EF.member()
      bid: number = 0

      @EF.foreign(Bar, 'bar', 'name')
      @EF.member()
      bName: string = ''

      @EF.navigator(EF.Relationship.One, 'bar')
      bar?: Bar
    }

    class Context extends EF.EntityContext {
      @EF.set()
      foo = new EF.EntitySet<Foo>(this, Foo)
      @EF.set()
      jar = new EF.EntitySet<Jar>(this, Jar)
      @EF.set()
      bar = new EF.EntitySet<Bar>(this, Bar)
    }

    const ctx = new Context()
    await ctx.foo.include('jar').include('bar').load(1)
    const foo = ctx.foo.find(1)
    expect(foo).toHaveProperty('id', 1)
    expect(foo!.bar).toBeDefined()
    expect(foo!.bar).toHaveProperty('id', 1)
    expect(foo!.bar).toHaveProperty('name', 'ba1')
    expect(foo!.bar).toHaveProperty('age', 13)
    expect(foo!.jar).toBeDefined()
    expect(foo!.jar).toHaveLength(2)
    expect(foo!.jar).toEqual([{ id: 1, name: 'ja1' }, { id: 2, name: 'ja2' }])
    expect(ctx.foo.size).toEqual(1)
    expect(ctx.bar.size).toEqual(1)
    expect(ctx.jar.size).toEqual(2)
  })

  it('query a foo with a foreign key bar(id, name), and cascading query to zar(id) by bar', async () => {
    @EF.behavior('load', 'http://localhost:3000/zar/$id', 'GET')
    class Zar {
      @EF.primary()
      @EF.member()
      id: number = 0

      @EF.member()
      name: string = ''
    }

    @EF.behavior('load', 'http://localhost:3000/bar?id=$id&name=$name', 'GET', (...a: any[]) => a, (a: any[]) => a[0])
    class Bar {
      @EF.primary()
      @EF.member()
      id: number = 0

      @EF.primary()
      @EF.member()
      name: string = ''

      @EF.member()
      age: number = 0

      @EF.foreign(Zar, 'zar', 'id')
      @EF.member()
      zid: number = 0

      @EF.navigator(EF.Relationship.One, 'zar')
      zar?: Zar
    }

    @EF.behavior('load', 'http://localhost:3000/foo/$id', 'GET')
    class Foo {
      @EF.primary()
      @EF.member()
      id: number = 0

      @EF.member('name')
      aliasName: string = ''

      @EF.foreign(Bar, 'bar', 'id')
      @EF.member()
      bid: number = 0

      @EF.foreign(Bar, 'bar', 'name')
      @EF.member()
      bName: string = ''

      @EF.navigator(EF.Relationship.One, 'bar')
      bar?: Bar
    }

    class Context extends EF.EntityContext {
      @EF.set()
      foo = new EF.EntitySet<Foo>(this, Foo)
      @EF.set()
      bar = new EF.EntitySet<Bar>(this, Bar)
      @EF.set()
      zar = new EF.EntitySet<Zar>(this, Zar)
    }

    const ctx = new Context()
    await ctx.foo.include('bar').include('zar').load(1)
    const foo = ctx.foo.find(1)
    expect(foo).toHaveProperty('id', 1)
    expect(foo!.bar).toBeDefined()
    expect(foo!.bar).toHaveProperty('id', 1)
    expect(foo!.bar).toHaveProperty('name', 'ba1')
    expect(foo!.bar).toHaveProperty('age', 13)
    expect(foo!.bar!.zar).toBeDefined()
    expect(foo!.bar!.zar).toHaveProperty('id', 1)
    expect(foo!.bar!.zar).toHaveProperty('name', 'za1')
    expect(ctx.foo.size).toEqual(1)
    expect(ctx.bar.size).toEqual(1)
    expect(ctx.zar.size).toEqual(1)
  })

  it('there is not any side-effect between two load behaviors', async () => {
    @EF.behavior('load', 'http://localhost:3000/foo/$id', 'GET')
    class Foo {
      @EF.primary()
      @EF.member()
      id: number = 0

      @EF.member('name')
      aliasName: string = ''
    }

    class Context extends EF.EntityContext {
      @EF.set()
      foo = new EF.EntitySet<Foo>(this, Foo)
    }

    const ctx = new Context()
    await ctx.foo.load(1)
    const foo1 = ctx.foo.find(1)

    await ctx.foo.load(2)
    const foo2 = ctx.foo.find(2)

    expect(foo1).not.toEqual(foo2)
    expect(ctx.foo.size).toEqual(1)
  })

  it('add two foo to set and synchronize changes to remote', async () => {
    @EF.behavior('add', 'http://localhost:3000/foo', 'POST')
    class Foo {
      @EF.primary()
      @EF.member()
      id: number = 0

      @EF.member()
      name: string = ''
    }

    class Context extends EF.EntityContext {
      @EF.set()
      foo = new EF.EntitySet<Foo>(this, Foo)
    }

    const ctx = new Context()
    const foo1 = ctx.foo.entry({
      id: 6,
      name: '巫行云'
    })
    const foo2 = ctx.foo.entry({
      id: 7,
      name: '李秋水'
    })

    ctx.foo.add(foo1, foo2)
    const res1 = await ctx.saveChanges()
    expect(res1).toEqual([foo1, foo2])
  })

  it('remove two foo from set and synchronize changes to remote', async () => {
    @EF.behavior('loadAll', 'http://localhost:3000/foo?name=$name', 'GET', ({ name }) => name)
    @EF.behavior('delete', 'http://localhost:3000/foo/$id', 'DELETE')
    class Foo {
      @EF.primary()
      @EF.member()
      id: number = 0

      @EF.member()
      name: string = ''
    }

    class Context extends EF.EntityContext {
      @EF.set()
      foo = new EF.EntitySet<Foo>(this, Foo)
    }

    const ctx = new Context()
    await ctx.foo.loadAll({ name: 'fa4' })
    const set = ctx.foo.filter((n) => n.name === 'fa4')
    expect(set).toHaveLength(2)

    ctx.foo.remove(...set)
    const res = await ctx.saveChanges()
    expect(res).toEqual([{}, {}])
  })

  it('update a foo from set and synchronize changes to remote', async () => {
    @EF.behavior('loadAll', 'http://localhost:3000/bar?name=$name', 'GET', ({ name }) => name)
    @EF.behavior('update', 'http://localhost:3000/bar/$id', 'PATCH')
    class Bar {
      @EF.primary()
      @EF.member()
      id: number = 0

      @EF.member()
      name: string = ''

      @EF.member()
      age: number = 0
    }

    class Context extends EF.EntityContext {
      @EF.set()
      bar = new EF.EntitySet<Bar>(this, Bar)
    }

    const ctx = new Context()
    await ctx.bar.loadAll({ name: 'ba4' })

    const bar = ctx.bar.find(4)
    bar!.age = 53

    const res = await ctx.saveChanges()
    expect(res).toEqual([bar])
  })
})
