import manager, { MetadataType, Member } from '../metadataManager'

export default (fieldName?: string) => (target: Object, propertyName: string) => {
  manager.register<Member>(target, MetadataType.Member, { fieldName: fieldName || propertyName, propertyName })
}
