import manager, { MetadataType, ForeignKey } from '../metadataManager'

export default (constructor: { new(): {} }, navigatorName: string, fieldName?: string) => (target: Object, property: string) => {
  manager.register<ForeignKey>(target, MetadataType.ForeignKey, {
    fieldName: fieldName || property,
    constructor,
    navigatorName,
    propertyName: property
  })
}
