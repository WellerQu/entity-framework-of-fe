import metadata from './annotations/metadataManager'

export default class EntityContext {
  public get metadata () {
    return metadata
  }
  public saveChanges () { }
}
