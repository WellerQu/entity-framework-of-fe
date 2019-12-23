import manager, { MetadataType, Relationship, Navigator } from '../metadataManager'

export default (relationship: Relationship, navigatorName: string, fieldName?: string) => (target: Object, property: string) => {
  manager.register<Navigator>(target, MetadataType.Navigator, { fieldName: fieldName || property, relationship, navigatorName })
}
