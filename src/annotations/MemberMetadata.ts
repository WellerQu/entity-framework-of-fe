import MetadataType from '../constants/metadataType'

type MemberData = { members?: Member[] }

export class MemberMetadata implements IMetadata<Member> {
  constructor (private ctx: IMetadataContext, next?: IMetadata<{}>) {
    this.next = next
  }

  next?: IMetadata<{}> | undefined;

  setData (type: MetadataType, prototype: object, meta: Member) {
    if (type === MetadataType.Member) {
      if (!this.ctx.model.has(prototype)) {
        this.ctx.model.set(prototype, { members: [] } as MemberData)
      }

      const metadata = this.ctx.model.get(prototype) as MemberData
      if (!metadata.members) {
        metadata.members = []
      }

      metadata.members.push(meta)
      return
    }

    if (this.next) {
      return this.next.setData(type, prototype, meta)
    }
  }

  getData (type: MetadataType, prototype: object, ...args: any[]) {
    if (type === MetadataType.Member) {
      const metadata = this.ctx.model.get(prototype) as MemberData | undefined
      if (!metadata) {
        return
      }

      const propertyName = args[0] as string | undefined
      if (!propertyName) {
        return metadata.members
      }

      return metadata.members?.find(item => item.propertyName === propertyName)
    }

    if (this.next) {
      return this.next.getData(type, prototype, ...args)
    }
  }
}
