import EntityContext from './entityContext'
import EntityState from './entityState'
import EntityTrace, { PropertyChangeEvent } from './entityTrace'
import Relationships from './constants/relationship'
import metadata from './annotations/entityMetadataManager'
import isEmpty from './utils/isEmpty'
import Constraints from './constants/constraints'

export type OriginJSON = Promise<any>

const identity = (a: any) => a

type Store = {
  [key: string]: any
}

export default class EntitySet<T extends Object> {
  constructor (private ctx: EntityContext, type: { new(): T}) {
    this.set = new Set<EntityTrace<T>>()
    this.ownNavigatorRequests = {}
    this.otherNavigators = []
    this.entityMetadata = { type }
    this.onPropertyBeforeChange = this.onPropertyBeforeChange.bind(this)
    this.onPropertyAfterChange = this.onPropertyAfterChange.bind(this)
  }

  private set: Set<EntityTrace<T>>
  private ownNavigatorRequests: Record<string, (entity: T | null) => Promise<any>>
  private otherNavigators: string[]
  private entityMetadata: {
    type: { new() : T },
  }

  private parseOriginDataToEntity (originData: {}): T | null {
    // 无数据
    if (isEmpty(originData)) {
      return null
    }

    const entity = this.entry(originData)

    return entity
  }

  private getRelatedEntitySet (navigatorName: string) {
    const ctxPrototype = Reflect.getPrototypeOf(this.ctx)
    const entitySetMeta = metadata.getEntitySet(ctxPrototype, navigatorName)
    if (!entitySetMeta) {
      throw new Error(`当前上下文中没有配置EntitySet "${navigatorName}"`)
    }
    const entitySet = Reflect.get(this.ctx, entitySetMeta.propertyName) as EntitySet<any>
    if (!entitySet) {
      throw new Error(`当前上下文中没有配置EntitySet "${entitySetMeta.propertyName}"`)
    }
    return entitySet
  }

  public get size () {
    const entries = Array.from(this.set).filter(item => item.state !== EntityState.Deleted && item.state !== EntityState.Detached)
    return entries.length
  }

  public clean (): this {
    return this.cleanSet().cleanNavigators()
  }

  private cleanSet (): this {
    Array.from(this.set).forEach(item => {
      item.offPropertyBeforeChange(this.onPropertyBeforeChange)
      item.offPropertyAfterChange(this.onPropertyAfterChange)
    })
    this.set.clear()

    return this
  }

  private cleanNavigators (): this {
    this.ownNavigatorRequests = {}
    this.otherNavigators = []

    return this
  }

  public add (...entities: (T| undefined)[]): this {
    entities.filter(item => !!item).forEach(addedItem => {
      const tracer = new EntityTrace<T>(addedItem!, EntityState.Added)
      tracer.onPropertyBeforeChange(this.onPropertyBeforeChange)
      tracer.onPropertyAfterChange(this.onPropertyAfterChange)

      this.set.add(tracer)
    })

    return this
  }

  public remove (...entities: (T| undefined)[]): this {
    const navigators = metadata.getNavigators(this.entityMetadata.type.prototype)

    entities.filter(item => !!item).forEach(removedItem => {
      const tracer = Array.from(this.set)
        .find(item => (item.rawObject === removedItem || item.object === removedItem) &&
          item.state !== EntityState.Deleted &&
          item.state !== EntityState.Detached)

      if (tracer) {
        // 删除与当前传入数据直接相关的数据
        navigators.forEach(nav => {
          const entitySet = this.getRelatedEntitySet(nav.navigatorName)
          if (!entitySet) {
            return
          }

          const entry = Reflect.get(removedItem!, nav.propertyName)
          if (!entry) {
            return
          }

          if (nav.relationship === Relationships.One) {
            entitySet.remove(entry)
          } else if (nav.relationship === Relationships.Many) {
            entitySet.remove(...entry)
          } else {
            throw new Error('未定义的Relationship')
          }
        })

        // 删除当前传入的数据
        tracer.state = EntityState.Deleted
        tracer.offPropertyBeforeChange(this.onPropertyBeforeChange)
        tracer.offPropertyAfterChange(this.onPropertyAfterChange)
        tracer.revoke()
      }
    })

    return this
  }

  public attach (...entities: (T | undefined)[]): this {
    entities.filter(item => !!item).forEach(attachedItem => {
      const tracer = new EntityTrace<T>(attachedItem!, EntityState.Unchanged)
      tracer.onPropertyBeforeChange(this.onPropertyBeforeChange)
      tracer.onPropertyAfterChange(this.onPropertyAfterChange)

      this.set.add(tracer)
    })

    return this
  }

  public detach (...entities: (T | undefined)[]): this {
    entities.filter(item => !!item).forEach(detachedItem => {
      const stateTrace = Array.from(this.set)
        .find(item =>
          (item.object === detachedItem || item.rawObject === detachedItem) &&
          item.state !== EntityState.Detached &&
          item.state !== EntityState.Deleted)

      if (stateTrace) {
        stateTrace.state = EntityState.Detached
        stateTrace.offPropertyBeforeChange(this.onPropertyBeforeChange)
        stateTrace.offPropertyAfterChange(this.onPropertyAfterChange)
        stateTrace.revoke()
      }
    })

    return this
  }

  /**
   * 通过传入的主键在数据集中查询实体实例, 参数的顺序为实体模型中被注解为 @[[primary]]() 的字段的顺序
   *
   * @example
   * ```typescript
   * class Foo {
   *   @primary()
   *   id: number = 0
   *   @primary()
   *   version: number = 0
   * }
   *
   * ctx.foo.find(1, 2)
   * // 参数 1 作为id, 参数 2 作为version
   * ```
   *
   * @param primaryKeys {...any[]} 主键字段
   * @returns
   */
  public find (...primaryKeys: any[]): T | undefined {
    const stateTrace = Array.from(this.set).find(item => {
      const keys = metadata.getPrimaryKeys(item.object.constructor.prototype)
      if (keys.length === 0) {
        return false
      }
      if (item.state === EntityState.Deleted) {
        return false
      }
      if (item.state === EntityState.Detached) {
        return false
      }

      return keys.every((meta, index) => {
        return Reflect.get(item.object, meta.fieldName) === primaryKeys[index]
      })
    })

    if (!stateTrace) {
      return
    }

    return stateTrace.object
  }

  public filter (fn: (n: T) => boolean): T[] {
    const stateTraces = Array.from(this.set).filter(item => {
      if (item.state === EntityState.Deleted) {
        return false
      }
      if (item.state === EntityState.Detached) {
        return false
      }

      return fn(Object.freeze(item.object))
    })

    return stateTraces.map(item => item.object)
  }

  public toList (): T[] {
    return Array.from(this.set).map(item => Object.freeze(item.object))
  }

  public async load (...args: any[]): Promise<Response> {
    const queryMeta = metadata
      .getBehavior(this.entityMetadata.type.prototype, 'load')

    if (!queryMeta) {
      throw new Error(`${this.entityMetadata.type.name} 没有配置Load behavior`)
    }

    const {
      mapParameters = (...a: any[]) => a,
      mapEntity = (p: Promise<any>) => p
    } = queryMeta
    const params = mapParameters(...args)
    const requests = Object.values(this.ownNavigatorRequests)

    return new Promise<Response>((resolve, reject) => {
      this.ctx.configuration
        .fetchData(queryMeta.url, { method: queryMeta.method }, params)
        .then(res => res.json(), reject)
        .then(json => {
          const data = mapEntity(json)
          const first = Array.isArray(data) ? data[0] : data
          const entity = this.parseOriginDataToEntity(first)

          return Promise.all(requests.map(fn => fn(entity))).then(() => {
            entity && this.attach(entity)
            resolve(json)
          }, reject)
        }, reject)
    })
  }

  public async loadAll <P = any> (...args: any[]): Promise<P> {
    const queryMeta = metadata
      .getBehavior(this.entityMetadata.type.prototype, 'loadAll')

    if (!queryMeta) {
      throw new Error(`${this.entityMetadata.type.name} 没有配置LoadAll behavior`)
    }

    const {
      mapParameters = (...a: any[]) => a,
      mapEntity = (a: any) => a
    } = queryMeta
    const params = mapParameters(...args)
    const requests = Object.values(this.ownNavigatorRequests)

    return new Promise<P>((resolve, reject) => {
      this.ctx.configuration
        .fetchData(queryMeta.url, { method: queryMeta.method }, params)
        .then(res => res.json(), reject)
        .then(json => {
          const data = mapEntity(json) as T[]
          const parse = this.parseOriginDataToEntity.bind(this)
          const entities = (data || []).map(parse).filter(item => !isEmpty(item))
          const promises = entities
            .map(entity => requests.map(fn => fn(entity)))
            .reduce((acc, val) => acc.concat(val), []) // 降低数组维度

          return Promise.all(promises)
            .then(() => {
              this.attach(...entities as T[])
              resolve(json)
            }, reject)
        }, reject)
    })
  }

  public include (navigatorName: string): this {
    if (this.ownNavigatorRequests[navigatorName]) {
      return this
    }

    const entitySet = this.getRelatedEntitySet(navigatorName)

    const navigator = metadata.getNavigator(this.entityMetadata.type.prototype, navigatorName as string)
    if (!navigator) {
      this.otherNavigators.push(navigatorName)
      return this
    }

    const foreignKeys = metadata
      .getForeignKeys(this.entityMetadata.type.prototype)
      .filter(key => key.navigatorName === navigatorName)
    const propertyName = navigator.propertyName

    const getRequestParameters = (entity: T) => {
      return foreignKeys.map(key => Reflect.get(entity, key.propertyName))
    }

    const request = async (entity: T | null) => {
      if (!entity) {
        return Promise.resolve(null)
      }

      const parameters = getRequestParameters(entity)
      const set = this.otherNavigators.reduce((es, nav) => es.include(nav), entitySet)

      if (navigator.relationship === Relationships.One) {
        // 请求关联实体的数据
        return set.load(...parameters).then((data) => {
          const relatedEntity = set.find(...parameters)
          Reflect.set(entity, propertyName, relatedEntity)

          return data
        })
      } else if (navigator.relationship === Relationships.Many) {
        // 提升参数parameters使用逻辑
        const useParameters = (exec: (primaryKey: any) => any) => (parameters: any[]) => {
          return parameters.filter(params => !!params)
            .map(params => params.map(exec))
            .reduce((acc, val) => acc.concat(val), [])
        }

        const getRequests = useParameters((primaryKey) => set.load(primaryKey))
        const getCollection = useParameters((primaryKey) => set.find(primaryKey))

        // 请求每一个关联实体的数据
        return Promise.all(getRequests(parameters)).then(res => {
          const collection = getCollection(parameters)

          Reflect.set(entity, propertyName, collection)

          return res
        })
      } else {
        throw new Error(`未定义的 Relationship: ${navigator.relationship}`)
      }
    }

    request.navigatorName = navigatorName

    this.ownNavigatorRequests[navigatorName] = request

    return this
  }

  /**
   * 将异构数据填充到实体实例, 如果默认实体实例为空, 则会创建新实例
   * @param originData 已经映射关系的异构数据
   * @param entity 实体实例
   * @returns 填充数据的实例
   */
  public entry (originData: {}, entity?: T): T {
    const instance = metadata.entry(originData, this.entityMetadata.type)

    if (!entity) {
      return instance as T
    }

    const keys = Object.keys(instance)
    keys.forEach(key => {
      const data = Reflect.get(instance, key)
      Reflect.set(entity, key, data)
    })

    return entity
  }

  public reverse (entity: T): Store {
    const Type = this.entityMetadata.type
    const members = metadata.getMembers(Type.prototype)
    const store: Store = {}

    members.forEach(item => {
      const fieldData = Reflect.get(entity, item.propertyName)
      store[item.fieldName] = fieldData
    })

    return store
  }

  /**
   * 将同构数据填充到实体实例, 如果默认实体实例为空, 则会创建新实例
   * @param originData 与 T 同构的数据
   * @param entity 实体实例
   * @returns 填充数据的实例
   */
  public fill (originData: {}, entity?: T): T {
    let instance = entity
    const Type = this.entityMetadata.type

    if (!entity) {
      instance = new Type()
    }

    const members = metadata.getMembers(Type.prototype)
    members.forEach(item => {
      const fieldData = Reflect.get(originData, item.propertyName)
      if (fieldData === undefined) {
        return
      }
      Reflect.set(instance!, item.propertyName, fieldData)
    })

    return instance!
  }

  public rawQuery (query: (fetch: (url: string, options: RequestInit, data?: {}) => Promise<Response>) => Promise<T[] | T>): Promise<T[]> {
    const requests = Object.values(this.ownNavigatorRequests)
    const fetchData = this.ctx.configuration.fetchData

    return new Promise((resolve, reject) => {
      query(fetchData)
        .then(originData => {
          const entities: T[] = []

          if (Array.isArray(originData)) {
            for (let i = 0; i < originData.length; i++) {
              const newEntity = this.parseOriginDataToEntity(originData[i])
              if (newEntity) {
                entities.push(newEntity)
              }
            }
          } else {
            const newEntity = this.parseOriginDataToEntity(originData)
            if (newEntity) {
              entities.push(newEntity)
            }
          }

          if (entities.length === 0) {
            return resolve([])
          }

          Promise.all(
            entities.map(entity => requests.map(fn => fn(entity)))
              .reduce((acc, val) => acc.concat(val), []) // 降低数组维度
          ).then(() => {
            this.attach(...entities)
            resolve(entities)
          }, reject)
        }, reject)
    })
  }

  private applyConstraints (special: Constraints, rawObject: T): {} {
    const members = metadata.getMembers(this.entityMetadata.type.prototype)
    const constraints = metadata.getMemberConstraints(this.entityMetadata.type.prototype)

    return members.reduce((params, m) => {
      const value = Reflect.get(rawObject, m.propertyName)
      const allConstraints = constraints[m.propertyName]

      if (!allConstraints) {
        Reflect.set(params, m.fieldName, value)
        return params
      }

      if ((allConstraints & Constraints.READ_ONLY) === Constraints.READ_ONLY) {
        return params
      }

      if ((allConstraints & special) === special && !isEmpty(value)) {
        Reflect.set(params, m.fieldName, value)
        return params
      }

      return params
    }, {})
  }

  private async synchronizeAddedState (item: EntityTrace<T>): Promise<any> {
    const rawObject = item.rawObject

    const behavior = metadata.getBehavior(rawObject.constructor.prototype, 'add')
    if (!behavior) {
      return (Promise.reject(new Error(`${rawObject.constructor.name} 没有配置Add behavior`)))
    }

    const {
      mapParameters = identity,
      mapEntity = identity
    } = behavior

    const applyConstraintsParams = this.applyConstraints(Constraints.NON_EMPTY_ON_ADDED, rawObject)
    const params = mapParameters(applyConstraintsParams)

    return new Promise((resolve, reject) => {
      this.ctx.configuration.fetchData(behavior.url, { method: behavior.method }, params)
        .then(res => res.json(), reject)
        .then(json => {
          item.state = EntityState.Unchanged
          return json
        }, reject)
        .then(mapEntity, reject)
        .then(resolve, reject)
    })
  }

  private async synchronizeDeletedState (item: EntityTrace<T>): Promise<any> {
    const rawObject = item.rawObject

    const primaryKeys = metadata.getPrimaryKeys(rawObject.constructor.prototype)
    const behavior = metadata.getBehavior(rawObject.constructor.prototype, 'delete')

    if (!behavior) {
      return (Promise.reject(new Error(`${rawObject.constructor.name} 没有配置Delete behavior`)))
    }

    const {
      mapParameters = identity,
      mapEntity = identity
    } = behavior

    const params = mapParameters(primaryKeys.reduce((params, m) => {
      Reflect.set(params, m.fieldName, Reflect.get(rawObject, m.propertyName))
      return params
    }, {}))

    return new Promise((resolve, reject) => {
      this.ctx.configuration.fetchData(behavior.url, { method: behavior.method }, params)
        .then(res => res.json(), reject)
        .then(json => {
          this.set.delete(item)
          return json
        }, reject)
        .then(mapEntity, reject)
        .then(resolve, reject)
    })
  }

  private async synchronizeModifiedState (item: EntityTrace<T>): Promise<any> {
    const rawObject = item.rawObject

    const behavior = metadata.getBehavior(rawObject.constructor.prototype, 'update')
    if (!behavior) {
      return (Promise.reject(new Error(`${rawObject.constructor.name} 没有配置 Update behavior`)))
    }

    const {
      mapParameters = identity,
      mapEntity = identity
    } = behavior

    const applyConstraintsParams = this.applyConstraints(Constraints.NON_EMPTY_ON_MODIFIED, rawObject)
    const params = mapParameters(applyConstraintsParams)

    return new Promise((resolve, reject) => {
      this.ctx.configuration.fetchData(behavior.url, { method: behavior.method }, params)
        .then(res => res.json(), reject)
        .then(res => {
          item.state = EntityState.Unchanged
          return res
        }, reject)
        .then(mapEntity, reject)
        .then(resolve, reject)
    })
  }

  public synchronizeState (): Promise<any>[] {
    const promises: Promise<any>[] = []

    for (let item of this.set) {
      if (item.state !== EntityState.Added &&
        item.state !== EntityState.Modified &&
        item.state !== EntityState.Deleted &&
        item.state !== EntityState.Detached) {
        continue
      }

      const state = item.state

      if (state === EntityState.Added) {
        promises.push(this.synchronizeAddedState(item))
        continue
      }

      if (state === EntityState.Deleted) {
        promises.push(this.synchronizeDeletedState(item))
        continue
      }

      if (state === EntityState.Modified) {
        promises.push(this.synchronizeModifiedState(item))
        continue
      }

      if (state === EntityState.Detached) {
        promises.push(Promise.resolve().then(() => {
          this.set.delete(item)
        }))
      }
    }

    return promises
  }

  private onPropertyBeforeChange (tracer: EntityTrace<T>, e: PropertyChangeEvent<T, EntityState>) {
    const constraints = metadata.getMemberConstraint(this.entityMetadata.type.prototype, e.propertyName)
    if (!constraints) {
      return
    }

    if ((constraints & Constraints.READ_ONLY) === Constraints.READ_ONLY) {
      throw new Error('无法修改一个添加了READ_ONLY约束的成员')
    }
  }

  private onPropertyAfterChange (tracer: EntityTrace<T>/*, e: PropertyChangeEvent<T, EntityState> */) {
    tracer.state = EntityState.Modified
  }
}
