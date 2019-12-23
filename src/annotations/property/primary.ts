import manager, { MetadataType, PrimaryKey } from '../metadataManager'

export default (fieldName?: string) => (target: Object, propertyName: string) => {
  manager.register<PrimaryKey>(target, MetadataType.PrimaryKey, { fieldName: fieldName || propertyName, propertyName })
}
