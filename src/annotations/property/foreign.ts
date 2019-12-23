import manager, { MetadataType, ForeignKey } from '../metadataManager'

export default (constructor: { new(): {} }, navigatorName: string, keyName?: string) => (target: Object, property: string) => {
  manager.register<ForeignKey>(target, MetadataType.ForeignKey, {
    fieldName: keyName || property,
    constructor,
    navigatorName
  })
}
