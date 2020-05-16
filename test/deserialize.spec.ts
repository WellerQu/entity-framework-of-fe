import { member, EntityContext, EntitySet, EntityConfiguration } from '../src'

describe('deserialize', () => {
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
    const foo = ctx.simpleSet.deserialize({ id: '1', name: 'foo' }) as Simple
    expect(foo).toBeInstanceOf(Simple)
    expect(foo.id).toEqual('1')
    expect(foo.name).toEqual('foo')
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
    const foo = ctx.simpleSet.deserialize({ uid: '234', username: 'foo' }) as Simple

    expect(foo).toBeInstanceOf(Simple)
    expect(foo.id).toEqual('234')
    expect(foo.name).toEqual('foo')
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
    const foo = ctx.simpleSet.deserialize({ id: '234', name: 'Hello Foo', redundant: 234 }) as Simple

    expect(foo.id).toEqual('234')
    expect(foo.name).toEqual('Hello Foo')
    expect(foo.redundant).toEqual(0)
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
      // barSet = new EntitySet(Bar)
    }

    const ctx = new MyContext()
    const foo = ctx.fooSet.deserialize({ id: '234', name: 'Hello Foo', bar: { id: '456', name: 'Hello Bar' } }) as Foo

    expect(foo.id).toEqual('234')
    expect(foo.name).toEqual('Hello Foo')
    expect(foo.bar).toBeInstanceOf(Bar)
    expect(foo.bar.id).toEqual('456')
    expect(foo.bar.name).toEqual('Hello Bar')
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
    const foo = ctx.fooSet.deserialize({ id: '123', name: 'foo', foo: { id: '321', name: 'oof' } }) as Foo

    expect(foo.id).toEqual('123')
    expect(foo.name).toEqual('foo')
    expect(foo.foo).toBeInstanceOf(Foo)
    expect(foo.foo?.id).toEqual('321')
    expect(foo.foo?.name).toEqual('oof')
  })
})
