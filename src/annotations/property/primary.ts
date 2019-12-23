import manager, { MetadataType, PrimaryKey } from '../metadataManager'

export default (name?: string) => (target: Object, property: string) => {
  manager.register<PrimaryKey>(target, MetadataType.PrimaryKey, { fieldName: name || property })
}
