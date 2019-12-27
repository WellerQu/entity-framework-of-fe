import manager, { MetadataType, ForeignKey } from '../metadataManager'

export default (constructor: { new(): {} }, navigatorName: string) => (target: Object, property: string) => {
  manager.register<ForeignKey>(target, MetadataType.ForeignKey, {
    fieldName: property,
    constructor,
    navigatorName,
    propertyName: property
  })
}
