import metadata from './annotations/metadataManager'
import EntityConfiguration from './entityConfiguration'
import EntitySet from './entitySet'

export default class EntityContext {
  public get metadata () {
    return metadata
  }

  public get configuration () {
    return new EntityConfiguration()
  }

  public async saveChanges () {
    const setKeys = Reflect.ownKeys(this)
    return new Promise<any[]>((resolve, reject) => {
      Promise.all(setKeys
        .map(key => (Reflect.get(this, key)as EntitySet<any>).synchronizeState())
        .reduce((acc, val) => acc.concat(val))).then(resolve, reject)
    })
  }
}
