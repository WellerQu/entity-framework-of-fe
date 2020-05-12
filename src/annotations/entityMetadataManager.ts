import MetadataType from './metadataType'
import isEmpty from '../utils/isEmpty'
import Constraints from '../constants/constraints'

export type Store = {
  [key: string]: any
}

export { MetadataType, Constraints }

/**
 * 注解实体模型的字段元数据
 *
 * @category annotations
 */
export interface Field {
  /**
   * 字段名称
   */
  fieldName: string;
  /**
   * 属性名称
   */
  propertyName: string;
}

/**
 * 注解实体模型的成员字段元数据, 通过添加注解 @[[member]]() 产生
 *
 * @category annotations
 */
export interface Member extends Field {
  dataType?: () => { new(): object }
}

/**
 * 成员数据值得约束
 *
 * @category annotations
 */
export interface MemberConstraints {
  /**
   * 成员值约束
   */
  constraints: Constraints,
  /**
   * 属性名
   */
  propertyName: string
}

const UNREGISTER_DATATYPE = '未注册的数据类型'

/**
 * @module annotations
 * @class MetadataManager
 */
class EntityMetadataManager {
  private managedModel = new WeakMap<Object, {
    members: Member[],
    constraints: Record<string, Constraints | undefined>,
  }>()

  register<T extends Member | MemberConstraints> (prototype: Object, type: MetadataType, meta: T) {
    if (!this.managedModel.has(prototype)) {
      this.managedModel.set(prototype, {
        members: [],
        constraints: {}
      })
    }

    if (type === MetadataType.Constraint) {
      const newMeta = meta as MemberConstraints
      const allConstraints = this.managedModel.get(prototype)!.constraints

      if (!allConstraints[newMeta.propertyName]) {
        allConstraints[newMeta.propertyName] = Constraints.NONE
      }

      allConstraints[newMeta.propertyName]! |= newMeta.constraints

      return allConstraints
    }

    if (type === MetadataType.Member) {
      return this.managedModel.get(prototype)!.members.push(meta as Member)
    }
  }

  unregister (prototype: Object) {
    this.managedModel.has(prototype) && this.managedModel.delete(prototype)
  }

  getMembers (prototype: Object): Member[] {
    if (!this.managedModel.has(prototype)) {
      return []
    }

    return this.managedModel.get(prototype)!.members
  }

  getMemberConstraints (prototype: Object) {
    if (!this.managedModel.has(prototype)) {
      return {}
    }

    return this.managedModel.get(prototype)!.constraints
  }

  getMemberConstraint (prototype: Object, propertyName: string) {
    return this.getMemberConstraints(prototype)[propertyName]
  }

  entry (originData: {} | undefined, Type: { new(): object }, isomorphism = false): object | object[] {
    const members = this.getMembers(Type.prototype)
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
        const memberFieldData = Reflect.get(data, isomorphism ? item.propertyName : item.fieldName)
        if (memberFieldData === undefined || memberFieldData === null) {
          // return Reflect.set(instance, item.propertyName, memberFieldData)
          return
        }

        if (!item.dataType) {
          return Reflect.set(instance, item.propertyName, memberFieldData)
        }

        const memberInstance = this.entry(memberFieldData, item.dataType(), isomorphism)
        Reflect.set(instance, item.propertyName, memberInstance)
      })

      return instance
    })
  }

  reverse (instances: object | object[], Type: { new(): object }, constraints = Constraints.NONE): object|object[] {
    const members = this.getMembers(Type.prototype)
    if (!members) {
      throw new Error(UNREGISTER_DATATYPE)
    }

    if (instances === undefined || instances === null) {
      return instances
    }

    if (!Array.isArray(instances)) {
      return (this.reverse([instances], Type, constraints) as object[])[0]
    }

    return instances.map(record => {
      const store: Store = {}

      members.forEach(member => {
        const memberConstraints = this.getMemberConstraint(Type.prototype, member.propertyName) ?? Constraints.NONE
        if ((constraints & Constraints.READ_ONLY) === Constraints.READ_ONLY && (memberConstraints & Constraints.READ_ONLY) === Constraints.READ_ONLY) {
          return
        }

        const data = Reflect.get(record, member.propertyName)
        if ((constraints & Constraints.NON_EMPTY) === Constraints.NON_EMPTY && (memberConstraints & Constraints.NON_EMPTY) === Constraints.NON_EMPTY && isEmpty(data)) {
          return
        }

        if (!member.dataType) {
          return Reflect.set(store, member.fieldName, data)
        }

        const memberData = this.reverse(data, member.dataType(), constraints)
        return Reflect.set(store, member.fieldName, memberData)
      })

      return store
    })
  }
}

const manager = new EntityMetadataManager()

export default manager
