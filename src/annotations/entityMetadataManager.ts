import MetadataType from './metadataType'
import isEmpty from '../utils/isEmpty'
import ConstraintOption from '../constants/constraintOption'

export type Store = {
  [key: string]: any
}

export { MetadataType, ConstraintOption }

/**
 * 注解实体模型的字段元数据
 *
 * @category annotations
 */
export interface Property {
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
export interface Member extends Property {
  /**
   * 字段名称
   */
  fieldName: string;
  /**
   * 属性类型
   */ 
  propertyDataType?: () => { new(): object }
}

export interface Mapping extends Property {
  /**
   * object中的位置
   */
  path: string;
}

/**
 * 成员数据值得约束
 *
 * @category annotations
 */
export interface Constraints {
  /**
   * 成员值约束
   */
  constraints: ConstraintOption,
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
    constraints: Record<string, ConstraintOption | undefined>,
  }>()

  register<T extends Member | Constraints | Mapping> (prototype: object, type: MetadataType, meta: T) {
    if (!this.managedModel.has(prototype)) {
      this.managedModel.set(prototype, {
        members: [],
        constraints: {}
      })
    }

    if (type === MetadataType.Constraint) {
      const newMeta = meta as Constraints
      const allConstraints = this.managedModel.get(prototype)!.constraints

      if (!allConstraints[newMeta.propertyName]) {
        allConstraints[newMeta.propertyName] = ConstraintOption.NONE
      }

      allConstraints[newMeta.propertyName]! |= newMeta.constraints

      return allConstraints
    }

    if (type === MetadataType.Member) {
      return this.managedModel.get(prototype)!.members.push(meta as Member)
    }
  }

  unregister (prototype: object) {
    this.managedModel.has(prototype) && this.managedModel.delete(prototype)
  }

  getMembers (prototype: object): Member[] {
    if (!this.managedModel.has(prototype)) {
      return []
    }

    return this.managedModel.get(prototype)!.members
  }

  getMemberConstraints (prototype: object) {
    if (!this.managedModel.has(prototype)) {
      return {}
    }

    return this.managedModel.get(prototype)!.constraints
  }

  getMemberConstraint (prototype: object, propertyName: string) {
    return this.getMemberConstraints(prototype)[propertyName]
  }

  entry (originData: object | undefined, Type: { new(): object }, isomorphism = false): object | object[] | never {
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
    const members = this.getMembers(Type.prototype)
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
        const memberConstraints = this.getMemberConstraint(Type.prototype, member.propertyName) ?? ConstraintOption.NONE
        if ((constraints & ConstraintOption.READ_ONLY) === ConstraintOption.READ_ONLY && (memberConstraints & ConstraintOption.READ_ONLY) === ConstraintOption.READ_ONLY) {
          return
        }

        const data = Reflect.get(record, member.propertyName)
        if ((constraints & ConstraintOption.NON_EMPTY) === ConstraintOption.NON_EMPTY && (memberConstraints & ConstraintOption.NON_EMPTY) === ConstraintOption.NON_EMPTY && isEmpty(data)) {
          return
        }

        if (!member.propertyDataType) {
          return Reflect.set(store, member.fieldName, data)
        }

        const memberData = this.revert(data, member.propertyDataType(), constraints)
        return Reflect.set(store, member.fieldName, memberData)
      })

      return store
    })
  }
}

const manager = new EntityMetadataManager()

export default manager
