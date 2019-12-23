import manager, { MetadataType, Member } from '../metadataManager'

export default (name?: string) => (target: Object, property: string) => {
  manager.register<Member>(target, MetadataType.Member, { fieldName: name || property })
}
