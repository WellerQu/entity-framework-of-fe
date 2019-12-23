import manager, { MetadataType, PrimaryKey } from '../metadataManager'

export default (fieldName?: string) => (target: Object, property: string) => {
  manager.register<PrimaryKey>(target, MetadataType.PrimaryKey, { fieldName: fieldName || property })
}
