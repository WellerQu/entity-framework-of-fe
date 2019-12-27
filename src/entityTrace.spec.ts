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

    expect(trace.object).toEqual(foo)
    expect(trace.rawObject).toEqual(foo)
  })

  it('revoke', () => {
    const foo = { id: 1, name: 'foo' }
    const trace = new EntityTrace(foo, EntityState.Added)

    expect(() => {
      trace.revoke()
    }).not.toThrow()

    expect(() => {
      trace.object.id = 2
    }).toThrow()

    expect(() => {
      trace.rawObject.id = 2
    }).not.toThrow()
  })

  it('onPropertyChange & offPropertyChange', () => {
    const foo = { id: 1, name: 'foo' }
    const trace = new EntityTrace(foo, EntityState.Added)

    const handlePropertyChange = jest.fn()

    trace.onPropertyChange(handlePropertyChange)
    trace.object.name = 'hhhhh'
    expect(handlePropertyChange).toHaveBeenCalledTimes(1)
    expect(handlePropertyChange).toHaveBeenCalledWith(trace, {
      propertyName: 'name',
      value: 'foo',
      newValue: 'hhhhh'
    })

    handlePropertyChange.mockReset()
    trace.offPropertyChange(handlePropertyChange)
    trace.object.name = 'foo'
    expect(handlePropertyChange).toHaveBeenCalledTimes(0)
  })
})
