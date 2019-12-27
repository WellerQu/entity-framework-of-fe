import manager, { MetadataType, Relationship, Navigator } from '../metadataManager'

export default (relationship: Relationship, navigatorName: string) => (target: Object, propertyName: string) => {
  manager.register<Navigator>(target, MetadataType.Navigator, { fieldName: propertyName, relationship, navigatorName, propertyName })
}
