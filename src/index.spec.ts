import * as EF from './index'

describe('Behavior-driven development', () => {
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
})
