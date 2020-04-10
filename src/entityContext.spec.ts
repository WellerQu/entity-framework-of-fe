import EntityContext from './entityContext'
import EntityConfiguration from './entityConfiguration'

describe('Entity Context', () => {
  class Configuration extends EntityConfiguration {
    public fetch<T = any> (url: string, options?: RequestInit): Promise<T> {
      return require('node-fetch')(url, options)
    }
  }

  describe('with constructor', () => {
    class Context extends EntityContext {
      constructor () {
        super(new Configuration())
      }
    }

    const ctx = new Context()

    it('configuration', () => {
      expect(ctx).toHaveProperty('configuration')
      expect(ctx).toBeDefined()
    })
  })
})
