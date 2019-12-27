import manager, { MetadataType, PrimaryKey } from '../metadataManager'

export default () => (target: Object, propertyName: string) => {
  manager.register<PrimaryKey>(target, MetadataType.PrimaryKey, { fieldName: propertyName, propertyName })
}
