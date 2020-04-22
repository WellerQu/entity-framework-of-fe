import EntityTrace from './entityTrace'
import EntityState from './entityState'

describe('EntityTrace', () => {
  it('constructor', () => {
    const foo = { id: 1, name: 'foo' }
    const trace = new EntityTrace(foo)
    expect(trace).toBeDefined()
    expect(trace.state).toEqual(EntityState.Unchanged)
  })

  it('constructor: state', () => {
    const foo = { id: 1, name: 'foo' }
    const trace = new EntityTrace(foo, EntityState.Added)
    expect(trace.state).toEqual(EntityState.Added)

    trace.state = EntityState.Detached
    expect(trace.state).toEqual(EntityState.Detached)
  })

  it('object & rawObject', () => {
    const foo = { id: 1, name: 'foo' }
    const trace = new EntityTrace(foo, EntityState.Added)

    expect(trace.proxyObject).toEqual(foo)
    expect(trace.rawObject).toEqual(foo)
  })

  it('revoke', () => {
    const foo = { id: 1, name: 'foo' }
    const trace = new EntityTrace(foo, EntityState.Added)

    expect(() => {
      trace.revoke()
    }).not.toThrow()

    expect(() => {
      trace.proxyObject.id = 2
    }).toThrow()

    expect(() => {
      trace.rawObject.id = 2
    }).not.toThrow()
  })

  it('onPropertyBeforeChange & offPropertyBeforeChange', () => {
    const foo = { id: 1, name: 'foo' }
    const trace = new EntityTrace(foo, EntityState.Added)

    const handlePropertyBeforeChange = jest.fn()

    trace.onPropertyBeforeChange(handlePropertyBeforeChange)
    trace.proxyObject.name = 'hhhhh'
    expect(handlePropertyBeforeChange).toHaveBeenCalledTimes(1)
    expect(handlePropertyBeforeChange).toHaveBeenCalledWith(trace, {
      propertyName: 'name',
      value: 'foo',
      newValue: 'hhhhh'
    })

    handlePropertyBeforeChange.mockReset()
    expect(handlePropertyBeforeChange).toHaveBeenCalledTimes(0)

    trace.offPropertyBeforeChange(handlePropertyBeforeChange)
    trace.proxyObject.name = 'foo'
    expect(handlePropertyBeforeChange).toHaveBeenCalledTimes(0)
  })

  it('onPropertyAfterChange & offPropertyAfterChange', () => {
    const foo = { id: 1, name: 'foo' }
    const trace = new EntityTrace(foo, EntityState.Added)

    const handlePropertyAfterChange = jest.fn()

    trace.onPropertyAfterChange(handlePropertyAfterChange)
    trace.proxyObject.name = 'hhhhh'
    expect(handlePropertyAfterChange).toHaveBeenCalledTimes(1)
    expect(handlePropertyAfterChange).toHaveBeenCalledWith(trace, {
      propertyName: 'name',
      value: 'foo',
      newValue: 'hhhhh'
    })

    handlePropertyAfterChange.mockReset()
    expect(handlePropertyAfterChange).toHaveBeenCalledTimes(0)

    trace.offPropertyAfterChange(handlePropertyAfterChange)
    trace.proxyObject.name = 'foo'
    expect(handlePropertyAfterChange).toHaveBeenCalledTimes(0)
  })
})
