import metadata from './annotations/entityMetadataManager'
import EntityConfiguration from './entityConfiguration'
import EntitySet from './entitySet'

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
  constructor (private _configuration?: EntityConfiguration) {
    if (!this._configuration) {
      this._configuration = new EntityConfiguration()
    }
  }

  public get entityMetadata () {
    return metadata
  }

  public get configuration () {
    return this._configuration!
  }

  public clean () {
    const entitySetKeys = this.entityMetadata
      .getEntitySets(Reflect.getPrototypeOf(this))
      .map(item => item.propertyName)

    entitySetKeys.forEach(key => {
      (Reflect.get(this, key) as EntitySet<any>).clean()
    })

    return this
  }

  public async saveChanges<T = any> () {
    const entitySetKeys = this.entityMetadata
      .getEntitySets(Reflect.getPrototypeOf(this))
      .map(item => item.propertyName)

    return Promise.all<T>(entitySetKeys
      .map(key => (Reflect.get(this, key) as EntitySet<any>).synchronizeState())
      .reduce((acc, val) => acc.concat(val), []))
  }
}
