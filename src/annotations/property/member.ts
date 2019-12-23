import manager, { MetadataType, Member } from '../metadataManager'

export default (fieldName?: string) => (target: Object, property: string) => {
  manager.register<Member>(target, MetadataType.Member, { fieldName: fieldName || property })
}
