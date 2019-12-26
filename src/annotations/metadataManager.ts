import MetadataType from './metadataType'
import Relationship from './relationship'

export interface Member {
  fieldName: string;
  propertyName: string;
}

export interface PrimaryKey extends Member { }

export interface ForeignKey extends Member {
  constructor: { new(): {} },
  navigatorName: string;
}

export interface Navigator extends Member {
  relationship: Relationship,
  navigatorName: string
}

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

class MetadataManager {
  private managed = new WeakMap<Object, {
    members: Member[],
    primaryKeys: PrimaryKey[],
    foreignKeys: ForeignKey[],
    behaviors: Behaviors,
    navigators: Navigators
  }>()

  register<T extends Member | PrimaryKey | ForeignKey | Behavior | Navigator> (prototype: Object, type: MetadataType, meta: T) {
    if (!this.managed.has(prototype)) {
      this.managed.set(prototype, {
        members: [],
        primaryKeys: [],
        foreignKeys: [],
        behaviors: {},
        navigators: {}
      })
    }

    if (type === MetadataType.Member) {
      return this.managed.get(prototype)!.members.push(meta as Member)
    }
    if (type === MetadataType.PrimaryKey) {
      return this.managed.get(prototype)!.primaryKeys.push(meta as PrimaryKey)
    }
    if (type === MetadataType.ForeignKey) {
      return this.managed.get(prototype)!.foreignKeys.push(meta as ForeignKey)
    }
    if (type === MetadataType.Navigator) {
      const navigatorMeta = meta as Navigator
      return (this.managed.get(prototype)!.navigators[navigatorMeta.navigatorName] = navigatorMeta)
    }
    if (type === MetadataType.Behavior) {
      const behaviorMeta = meta as Behavior
      return (this.managed.get(prototype)!.behaviors[behaviorMeta.behaviorName] = behaviorMeta)
    }
  }

  unregister (prototype: Object) {
    this.managed.has(prototype) && this.managed.delete(prototype)
  }

  getMembers (prototype: Object): Member[] {
    if (!this.managed.has(prototype)) {
      return []
    }

    return this.managed.get(prototype)!.members
  }

  getPrimaryKeys (prototype: Object): PrimaryKey[] {
    if (!this.managed.has(prototype)) {
      return []
    }

    return this.managed.get(prototype)!.primaryKeys
  }

  getForeignKeys (prototype: Object): ForeignKey[] {
    if (!this.managed.has(prototype)) {
      return []
    }

    return this.managed.get(prototype)!.foreignKeys
  }

  getBehavior (prototype: Object, behaviorName: BehaviorName): Behavior | undefined {
    if (!this.managed.has(prototype)) {
      return
    }

    return this.managed.get(prototype)!.behaviors[behaviorName]
  }

  getNavigator (prototype: Object, navigatorName: keyof Navigators): Navigator | undefined {
    if (!this.managed.has(prototype)) {
      return
    }

    return this.managed.get(prototype)!.navigators[navigatorName]
  }

  getNavigators (prototype: Object): Navigator[] {
    if (!this.managed.has(prototype)) {
      return []
    }

    return Object.values(this.managed.get(prototype)!.navigators)
  }
}

const manager = new MetadataManager()

export default manager
