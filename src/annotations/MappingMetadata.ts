import MetadataType from '../constants/metadataType'

type MappingData = { mappings: Record<string, Mapping> }

export class MappingMetadata implements IMetadata<Mapping> {
  constructor (private ctx: IMetadataContext, next?: IMetadata<{}>) {
    this.next = next
  }

  next?: IMetadata<{}> | undefined;

  setData (type: MetadataType, prototype: object, meta: Mapping) {
    if (type === MetadataType.Mapping) {
      if (!this.ctx.model.has(prototype)) {
        this.ctx.model.set(prototype, { mappings: {} } as MappingData)
      }

      const metadata = this.ctx.model.get(prototype) as MappingData
      if (!metadata.mappings) {
        metadata.mappings = {}
      }

      metadata.mappings[meta.propertyName] = meta
      return
    }

    if (this.next) {
      this.next.setData(type, prototype, meta)
    }
  }

  getData (type: MetadataType, prototype: object, ...args: any[]) {
    if (type === MetadataType.Mapping) {
      const metadata = this.ctx.model.get(prototype) as MappingData | undefined
      if (!metadata) {
        return
      }

      const propertyName = args[0]
      if (!propertyName) {
        return metadata.mappings
      }

      return metadata.mappings ? metadata.mappings[propertyName] : undefined
    }

    if (this.next) {
      return this.next.getData(type, prototype, ...args)
    }
  }
}
