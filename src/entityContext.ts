import metadata from './annotations/metadataManager'
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

  public get metadata () {
    return metadata
  }

  public get configuration () {
    return this._configuration!
  }

  public async saveChanges () {
    const entitySetKeys = this.metadata.getEntitySets(Reflect.getPrototypeOf(this)).map(item => item.propertyName)
    return new Promise<any[]>((resolve, reject) => {
      Promise.all(entitySetKeys
        .map(key => (Reflect.get(this, key)as EntitySet<any>).synchronizeState())
        .reduce((acc, val) => acc.concat(val), []))
        .then(resolve, reject)
    })
  }
}
