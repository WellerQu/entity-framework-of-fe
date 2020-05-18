import MetadataType from '../constants/metadataType'
import ConstraintOption from '../constants/constraintOption'

type ConstraintData = { constraints: Record<string, ConstraintOption | undefined>}

export class ConstraintMetadata implements IMetadata<Constraints> {
  constructor (private ctx: IMetadataContext, next?: IMetadata<{}>) {
    this.next = next
  }

  next?: IMetadata<{}> | undefined;

  setData (type: MetadataType, prototype: object, meta: Constraints) {
    if (type === MetadataType.Constraint) {
      if (!this.ctx.model.has(prototype)) {
        this.ctx.model.set(prototype, {} as ConstraintData)
      }

      const metadata = this.ctx.model.get(prototype) as ConstraintData
      if (!metadata.constraints) {
        metadata.constraints = { [meta.propertyName]: ConstraintOption.NONE }
      }
      if (!metadata.constraints[meta.propertyName]) {
        metadata.constraints[meta.propertyName] = ConstraintOption.NONE
      }

      metadata.constraints[meta.propertyName]! |= meta.constraints
      return
    }

    if (this.next) {
      return this.next.setData(type, prototype, meta)
    }
  }

  getData (type: MetadataType, prototype: object, ...args: any[]) {
    if (type === MetadataType.Constraint) {
      const metadata = this.ctx.model.get(prototype) as ConstraintData | undefined
      if (!metadata) {
        return
      }

      const propertyName = args[0] as string | undefined
      if (!propertyName) {
        return metadata.constraints
      }

      return metadata.constraints ? metadata.constraints[propertyName] : undefined
    }

    if (this.next) {
      return this.next.getData(type, prototype, ...args)
    }
  }
}
