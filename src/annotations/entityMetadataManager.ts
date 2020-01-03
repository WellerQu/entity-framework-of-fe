import MetadataType from './metadataType'
import Relationship from './relationship'

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
export interface Member extends Field { }

/**
 * 注解实体模型的主键字段元数据, 通过添加注解 @[[primary]]() 产生
 *
 * @category annotations
 */
export interface PrimaryKey extends Field { }

/**
 * 注解实体模型的外键字段元数据, 通过添加注解 @[[foreign]]() 产生
 *
 * @category annotations
 */
export interface ForeignKey extends Field {
  /**
   * 外键实体的构造函数
   */
  constructor: { new(): {} },
  /**
   * 导航字段名称
   */
  navigatorName: string;
}

/**
 * 注解实体模型的导航字段元数据, 通过添加注解 @[[navigator]]() 产生
 *
 * @category annotations
 */
export interface Navigator extends Field {
  /**
   * 实体间关系
   */
  relationship: Relationship,
  /**
   * 导航字段
   */
  navigatorName: string
}

export interface EntitySet extends Field { }

export type BehaviorName = 'load' | 'loadAll' | 'add' | 'delete' | 'update'
export interface Behavior<T = any> {
  behaviorName: BehaviorName;
  url: string;
  method: Method;
  mapParameters?: (...args: any[]) => T,
  mapEntity?: (response: Response) => Promise<T>
}

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

type Behaviors = Record<string, Behavior>
type Navigators = Record<string, Navigator>

export { MetadataType, Relationship }

/**
 * @module annotations
 * @class MetadataManager
 */
class EntityMetadataManager {
  private managedModel = new WeakMap<Object, {
    members: Member[],
    primaryKeys: PrimaryKey[],
    foreignKeys: ForeignKey[],
    behaviors: Behaviors,
    navigators: Navigators
  }>()

  private managedContext = new WeakMap<Object, {
    entities: EntitySet[]
  }>()

  register<T extends Member | PrimaryKey | ForeignKey | Behavior | Navigator | EntitySet> (prototype: Object, type: MetadataType, meta: T) {
    if (type !== MetadataType.Entity && !this.managedModel.has(prototype)) {
      this.managedModel.set(prototype, {
        members: [],
        primaryKeys: [],
        foreignKeys: [],
        behaviors: {},
        navigators: {}
      })
    }
    if (type === MetadataType.Entity && !this.managedContext.has(prototype)) {
      this.managedContext.set(prototype, {
        entities: []
      })
    }

    if (type === MetadataType.Member) {
      return this.managedModel.get(prototype)!.members.push(meta as Member)
    }
    if (type === MetadataType.PrimaryKey) {
      return this.managedModel.get(prototype)!.primaryKeys.push(meta as PrimaryKey)
    }
    if (type === MetadataType.ForeignKey) {
      return this.managedModel.get(prototype)!.foreignKeys.push(meta as ForeignKey)
    }
    if (type === MetadataType.Navigator) {
      const navigatorMeta = meta as Navigator
      return (this.managedModel.get(prototype)!.navigators[navigatorMeta.navigatorName] = navigatorMeta)
    }
    if (type === MetadataType.Behavior) {
      const behaviorMeta = meta as Behavior
      return (this.managedModel.get(prototype)!.behaviors[behaviorMeta.behaviorName] = behaviorMeta)
    }
    if (type === MetadataType.Entity) {
      const entityMeta = meta as EntitySet
      return (this.managedContext.get(prototype)!.entities.push(entityMeta))
    }
  }

  unregister (prototype: Object) {
    this.managedModel.has(prototype) && this.managedModel.delete(prototype)
    this.managedContext.has(prototype) && this.managedContext.delete(prototype)
  }

  getMembers (prototype: Object): Member[] {
    if (!this.managedModel.has(prototype)) {
      return []
    }

    return this.managedModel.get(prototype)!.members
  }

  getPrimaryKeys (prototype: Object): PrimaryKey[] {
    if (!this.managedModel.has(prototype)) {
      return []
    }

    return this.managedModel.get(prototype)!.primaryKeys
  }

  getForeignKeys (prototype: Object): ForeignKey[] {
    if (!this.managedModel.has(prototype)) {
      return []
    }

    return this.managedModel.get(prototype)!.foreignKeys
  }

  getBehavior (prototype: Object, behaviorName: BehaviorName): Behavior | undefined {
    if (!this.managedModel.has(prototype)) {
      return
    }

    return this.managedModel.get(prototype)!.behaviors[behaviorName]
  }

  getNavigator (prototype: Object, navigatorName: string): Navigator | undefined {
    if (!this.managedModel.has(prototype)) {
      return
    }

    return this.managedModel.get(prototype)!.navigators[navigatorName]
  }

  getNavigators (prototype: Object): Navigator[] {
    if (!this.managedModel.has(prototype)) {
      return []
    }

    return Object.values(this.managedModel.get(prototype)!.navigators)
  }

  getEntitySet (prototype: Object, navigatorName: string): EntitySet | undefined {
    if (!this.managedContext.has(prototype)) {
      return void 0
    }

    return this.managedContext.get(prototype)!.entities.find(item => item.fieldName === navigatorName)
  }

  getEntitySets (prototype: Object): EntitySet[] {
    if (!this.managedContext.has(prototype)) {
      return []
    }

    return this.managedContext.get(prototype)!.entities
  }
}

const manager = new EntityMetadataManager()

export default manager
