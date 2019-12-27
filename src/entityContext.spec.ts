import EntityContext from './entityContext'
import EntityConfiguration from './entityConfiguration'

describe('Entity Context', () => {
  describe('without constructor', () => {
    class Context extends EntityContext {
    }

    const ctx = new Context()

    it('metadata', () => {
      expect(ctx).toHaveProperty('metadata')
      expect(ctx).toBeDefined()
    })

    it('configuration', () => {
      expect(ctx).toHaveProperty('configuration')
      expect(ctx).toBeDefined()
    })
  })

  describe('with constructor', () => {
    class Context extends EntityContext {
      constructor () {
        super(new EntityConfiguration())
      }
    }

    const ctx = new Context()

    it('metadata', () => {
      expect(ctx).toHaveProperty('metadata')
      expect(ctx).toBeDefined()
    })

    it('configuration', () => {
      expect(ctx).toHaveProperty('configuration')
      expect(ctx).toBeDefined()
    })
  })
})
