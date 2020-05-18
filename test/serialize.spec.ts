import { member, EntityContext, EntitySet, EntityConfiguration, mapping } from '../src/index'

describe('serialize', () => {
  class MyConfiguration extends EntityConfiguration {
    protected fetch (): Promise<Response> {
      throw new Error('Method not implemented.')
    }
  }

  it('simple model: the property name is same with field name', () => {
    class Simple {
      @member()
      id: string = ''

      @member()
      name: string = ''
    }

    class MyContext extends EntityContext {
      constructor () {
        super(new MyConfiguration())
      }

      simpleSet = new EntitySet(Simple)
    }

    const ctx = new MyContext()
    const foo = new Simple()
    foo.id = '234'
    foo.name = 'Hello Foo'

    const serialized = ctx.simpleSet.serialize(foo)
    expect(serialized).toEqual({ id: '234', name: 'Hello Foo' })
  })

  it('simple model: the property name is different with field name', () => {
    class Simple {
      @member('uid')
      id: string = ''

      @member('username')
      name: string = ''
    }

    class MyContext extends EntityContext {
      constructor () {
        super(new MyConfiguration())
      }

      simpleSet = new EntitySet(Simple)
    }

    const ctx = new MyContext()
    const foo = new Simple()
    foo.id = '234'
    foo.name = 'Hello Foo'

    const serialized = ctx.simpleSet.serialize(foo)
    expect(serialized).toEqual({ uid: '234', username: 'Hello Foo' })
  })

  it('simple model: there are some redundant fields', () => {
    class Simple {
      @member()
      id: string = ''

      @member()
      name: string = ''

      redundant: number = 0
    }

    class MyContext extends EntityContext {
      constructor () {
        super(new MyConfiguration())
      }

      simpleSet = new EntitySet(Simple)
    }

    const ctx = new MyContext()
    const foo = new Simple()
    foo.id = '234'
    foo.name = 'Hello Foo'

    const serialized = ctx.simpleSet.serialize(foo)
    expect(serialized).toEqual({ id: '234', name: 'Hello Foo' })
  })

  it('simple model: mapping', () => {
    class Simple {
      @member()
      id: string = ''

      @member()
      name: string = ''

      @member()
      @mapping('a.b.c')
      age: number = 0
    }

    class MyContext extends EntityContext {
      constructor () {
        super(new MyConfiguration())
      }

      simpleSet = new EntitySet(Simple)
    }

    const ctx = new MyContext()
    const foo = new Simple()
    foo.id = '234'
    foo.name = 'Hello Foo'
    foo.age = 8

    const serialized = ctx.simpleSet.serialize(foo)
    expect(serialized).toEqual({ id: '234', name: 'Hello Foo', a: { b: { c: { age: 8 } } } })
  })

  it('composite model: the property name is same with field name', () => {
    class Foo {
      @member()
      id: string = ''

      @member()
      name: string = ''

      @member('bar', () => Bar)
      bar: Partial<Bar> = {}
    }

    class Bar {
      @member()
      id: string = ''

      @member()
      name: string = ''
    }

    class MyContext extends EntityContext {
      constructor () {
        super(new MyConfiguration())
      }

      fooSet = new EntitySet(Foo)
      barSet = new EntitySet(Bar)
    }

    const ctx = new MyContext()

    const foo = new Foo()
    foo.id = '234'
    foo.name = 'Hello Foo'

    const bar = new Bar()
    foo.bar = bar
    foo.bar.id = '456'
    foo.bar.name = 'Hello Bar'

    const serializedFoo = ctx.fooSet.serialize(foo)
    expect(serializedFoo).toEqual({ id: '234', name: 'Hello Foo', bar: { id: '456', name: 'Hello Bar' } })

    const serializedBar = ctx.barSet.serialize(bar)
    expect(serializedBar).toEqual({ id: '456', name: 'Hello Bar' })
  })

  it('composite model: recursive', () => {
    class Foo {
      @member()
      id: string = ''

      @member()
      name: string = ''

      @member('foo', () => Foo)
      foo?: Partial<Foo> = undefined
    }

    class MyContext extends EntityContext {
      constructor () {
        super(new MyConfiguration())
      }

      fooSet = new EntitySet(Foo)
    }

    const ctx = new MyContext()
    const foo = new Foo()
    foo.id = '123'
    foo.name = 'foo'
    foo.foo = new Foo()
    foo.foo.id = '321'
    foo.foo.name = 'oof'

    const serialized = ctx.fooSet.serialize(foo)
    expect(serialized).toEqual({ id: '123', name: 'foo', foo: { id: '321', name: 'oof', foo: {} } })
  })
})
