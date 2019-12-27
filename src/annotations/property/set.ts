import manager, { MetadataType, EntitySet } from '../metadataManager'

export default (navigatorName?: string) => (target: Object, property: string) => {
  manager.register<EntitySet>(target, MetadataType.Entity, {
    fieldName: navigatorName || property,
    propertyName: property
  })
}
