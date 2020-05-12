import EntityConfiguration from './entityConfiguration'

/**
 * @example
 * ```typescript
 * class YourContext extends EntityContext {
 * }
 *
 * const ctx = new YourContext()
 * ```
 */
export default class EntityContext {
  constructor (configuration: EntityConfiguration) {
    this._configuration = configuration
  }

  private _configuration: EntityConfiguration

  public get configuration () {
    return this._configuration!
  }

  public fetch (url: string, options: RequestInit, data?: {}) {
    return this.configuration.fetchData(url, options, data)
  }
}
