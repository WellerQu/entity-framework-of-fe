import manager, { MetadataType, Relationship, Navigator } from '../metadataManager'

export default (relationship: Relationship, navigatorName: string, name?: string) => (target: Object, property: string) => {
  manager.register<Navigator>(target, MetadataType.Navigator, { fieldName: name || property, relationship, navigatorName })
}
