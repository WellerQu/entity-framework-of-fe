import metadata from './annotations/metadataManager'
import EntityConfiguration from './entityConfiguration'

export default class EntityContext {
  public get metadata () {
    return metadata
  }
  public get configuration () {
    return new EntityConfiguration()
  }
  public saveChanges () { }
}
