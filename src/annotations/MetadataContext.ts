import MetadataType from '../constants/metadataType'
import isEmpty from '../utils/isEmpty'
import ConstraintOption from '../constants/constraintOption'
import { keyPathSetter, keyPathGetter } from '../utils/keyPath'

export { MetadataType, ConstraintOption }

const UNREGISTER_DATATYPE = '未注册的数据类型'

/**
 * @module annotations
 * @class MetadataContext
 */
export class MetadataContext {
  constructor(plugins: (new (ctx: MetadataContext, next: IMetadata<{}> | undefined) => IMetadata<{}>)[]) {
    // 实例化插件, 创建职责链
    this.pluginInstances = plugins.reduce<IMetadata<{}> | undefined>((next, Type) => new Type(this, next), undefined)
  }

  private pluginInstances?: IMetadata<{}>

  private managedModel = new WeakMap<object, {}>()

  public get model() {
    return this.managedModel
  }

  register<T extends Member | Constraints | Mapping>(prototype: object, type: MetadataType, meta: T) {
    if (!this.pluginInstances) {
      return
    }

    this.pluginInstances.setData(type, prototype, meta)
  }

  unregister (prototype: object) {
    this.managedModel.has(prototype) && this.managedModel.delete(prototype)
  }

  getRegisterData<T = any>(type: MetadataType, prototype: new () => object, propertyName?: string) {
    if (!this.pluginInstances) {
      return undefined
    }

    return this.pluginInstances.getData(type, prototype, propertyName) as T | undefined
  }

  entry (originData: object | undefined, Type: { new(): object }, isomorphism = false): object | object[] | never {
    const members = this.getRegisterData<Member[]>(MetadataType.Member, Type.prototype)
    if (!members) {
      throw new Error(UNREGISTER_DATATYPE)
    }

    if (!Array.isArray(originData)) {
      return (this.entry([originData], Type, isomorphism) as object[])[0]
    }

    return originData.map(data => {
      const instance = new Type()
      if (isEmpty(data)) {
        return instance
      }


      members.forEach(item => {
        const mapping = this.getRegisterData<Mapping>(MetadataType.Mapping, Type.prototype, item.propertyName)
        const key = isomorphism ? item.propertyName : item.fieldName
        const path = mapping?.path.split('.').concat([key]).join('.') ?? key
        const getter = keyPathGetter(path)

        // const memberFieldData = Reflect.get(data, isomorphism ? item.propertyName : item.fieldName)
        const memberFieldData = getter(data)
        if (memberFieldData === undefined || memberFieldData === null) {
          // return Reflect.set(instance, item.propertyName, memberFieldData)
          return
        }

        if (!item.propertyDataType) {
          return Reflect.set(instance, item.propertyName, memberFieldData)
        }

        const memberInstance = this.entry(memberFieldData, item.propertyDataType(), isomorphism)
        Reflect.set(instance, item.propertyName, memberInstance)
      })

      return instance
    })
  }

  revert(instances: object | object[], Type: { new(): object }, constraints = ConstraintOption.NONE): object | object[] | never {
    const members = this.getRegisterData<Member[]>(MetadataType.Member, Type.prototype)
    if (!members) {
      throw new Error(UNREGISTER_DATATYPE)
    }

    if (instances === undefined || instances === null) {
      return instances
    }

    if (!Array.isArray(instances)) {
      return (this.revert([instances], Type, constraints) as object[])[0]
    }

    return instances.map(record => {
      const store: Store = {}

      members.forEach(member => {
        const memberConstraints = this.getRegisterData<ConstraintOption>(MetadataType.Constraint, Type.prototype, member.propertyName) ?? ConstraintOption.NONE
        if ((constraints & ConstraintOption.READ_ONLY) === ConstraintOption.READ_ONLY && (memberConstraints & ConstraintOption.READ_ONLY) === ConstraintOption.READ_ONLY) {
          return
        }

        const data = Reflect.get(record, member.propertyName)
        if ((constraints & ConstraintOption.NON_EMPTY) === ConstraintOption.NON_EMPTY && (memberConstraints & ConstraintOption.NON_EMPTY) === ConstraintOption.NON_EMPTY && isEmpty(data)) {
          return
        }

        const mapping = this.getRegisterData<Mapping>(MetadataType.Mapping, Type.prototype, member.propertyName)
        const mappingPath = mapping ? mapping.path.split('.') : []
        const setter = keyPathSetter([...mappingPath, member.fieldName].join('.'))

        if (!member.propertyDataType) {
          return setter(store, data)
          // return Reflect.set(store, member.fieldName, data)
        }

        const memberData = this.revert(data, member.propertyDataType(), constraints)
        // return Reflect.set(store, member.fieldName, memberData)
        return setter(store, memberData)
      })

      return store
    })
  }
}

