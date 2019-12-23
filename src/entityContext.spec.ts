import EntityContext from './entityContext'

describe('Entity Context', () => {
  class Context extends EntityContext {
  }

  const ctx = new Context()

  it('metadata', () => {
    expect(ctx).toHaveProperty('metadata')
  })
})
