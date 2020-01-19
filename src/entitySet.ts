import EntityContext from './entityContext'
import EntityState from './entityState'
import EntityTrace from './entityTrace'
import Relationship from './annotations/relationship'
import isEmpty from './utils/isEmpty'

export default class EntitySet<T extends Object> {
  constructor (private ctx: EntityContext, type: { new(): T}) {
    this.set = new Set<EntityTrace<T>>()
    this.ownNavigatorRequests = {}
    this.otherNavigators = []
    this.entityMetadata = { type }
    this.onPropertyChanged = this.onPropertyChanged.bind(this)
  }

  private set: Set<EntityTrace<T>>
  private ownNavigatorRequests: Record<string, (entity: T | null) => Promise<any>>
  private otherNavigators: string[]
  private entityMetadata: {
    type: { new() : T },
  }

  private attachDataToEntitySet (originData: T): T | null {
    // 无数据
    if (isEmpty(originData)) {
      return null
    }

    const entity = this.entry(originData)

    this.attach(entity)

    return entity
  }

  private getRelatedEntitySet (navigatorName: string) {
    const ctxPrototype = Reflect.getPrototypeOf(this.ctx)
    const entitySetMeta = this.ctx.entityMetadata.getEntitySet(ctxPrototype, navigatorName)
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
    Array.from(this.set).forEach(item => item.offPropertyChange(this.onPropertyChanged))
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
      tracer.onPropertyChange(this.onPropertyChanged)

      this.set.add(tracer)
    })

    return this
  }

  public remove (...entities: (T| undefined)[]): this {
    const navigators = this.ctx.entityMetadata.getNavigators(this.entityMetadata.type.prototype)

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

          if (nav.relationship === Relationship.One) {
            entitySet.remove(entry)
          } else if (nav.relationship === Relationship.Many) {
            entitySet.remove(...entry)
          } else {
            throw new Error('未定义的Relationship')
          }
        })

        // 删除当前传入的数据
        tracer.state = EntityState.Deleted
        tracer.offPropertyChange(this.onPropertyChanged)
        tracer.revoke()
      }
    })

    return this
  }

  public attach (...entities: (T | undefined)[]): this {
    entities.filter(item => !!item).forEach(attachedItem => {
      const tracer = new EntityTrace<T>(attachedItem!, EntityState.Unchanged)
      tracer.onPropertyChange(this.onPropertyChanged)

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
        stateTrace.offPropertyChange(this.onPropertyChanged)
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
      const keys = this.ctx.entityMetadata.getPrimaryKeys(item.object.constructor.prototype)
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

  public async load (...args: any[]): Promise<T> {
    const queryMeta = this.ctx.entityMetadata
      .getBehavior(this.entityMetadata.type.prototype, 'load')

    if (!queryMeta) {
      throw new Error(`${this.entityMetadata.type.name} 没有配置Load behavior`)
    }

    const { mapParameters = (...a: any[]) => a, mapEntity = (a:any) => a } = queryMeta
    const params = mapParameters(...args)
    const requests = Object.values(this.ownNavigatorRequests)

    return new Promise<T>((resolve, reject) => {
      this.ctx.configuration
        .fetchJSON(queryMeta.url, { method: queryMeta.method }, params)
        .then(res => {
          const data = mapEntity(res)
          const entity = this.attachDataToEntitySet(data)
          Promise.all(requests.map(fn => fn(entity))).then(() => {
            resolve(data)
          })
        }, reject)
    })
  }

  public async loadAll (...args: any[]): Promise<T[]> {
    const queryMeta = this.ctx.entityMetadata
      .getBehavior(this.entityMetadata.type.prototype, 'loadAll')

    if (!queryMeta) {
      throw new Error(`${this.entityMetadata.type.name} 没有配置LoadAll behavior`)
    }

    const { mapParameters = (...a: any[]) => a, mapEntity = (a: any) => a } = queryMeta
    const params = mapParameters(...args)
    const requests = Object.values(this.ownNavigatorRequests)

    return new Promise<T[]>((resolve, reject) => {
      this.ctx.configuration
        .fetchJSON(queryMeta.url, { method: queryMeta.method }, params)
        .then((res) => {
          const data: T[] = mapEntity(res)
          const promises = (data || [])
            .map(item => this.attachDataToEntitySet(item))
            .map(entity => requests.map(fn => fn(entity)))
            .reduce((acc, val) => acc.concat(val), []) // 降低数组维度
          Promise.all(promises)
            .then(() => {
              resolve(data)
            })
        }, reject)
    })
  }

  public include (navigatorName: string): this {
    if (this.ownNavigatorRequests[navigatorName]) {
      return this
    }

    const entitySet = this.getRelatedEntitySet(navigatorName)

    const navigator = this.ctx.entityMetadata.getNavigator(this.entityMetadata.type.prototype, navigatorName as string)
    if (!navigator) {
      this.otherNavigators.push(navigatorName)
      return this
    }

    const foreignKeys = this.ctx.entityMetadata
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

      if (navigator.relationship === Relationship.One) {
        // 请求关联实体的数据
        return set.load(...parameters).then((data) => {
          const relatedEntity = set.find(...parameters)
          Reflect.set(entity, propertyName, relatedEntity)

          return data
        })
      } else if (navigator.relationship === Relationship.Many) {
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

  public entry (originData: {}): T {
    const Type = this.entityMetadata.type
    const instance = new Type()

    const members = this.ctx.entityMetadata.getMembers(Type.prototype)
    members.forEach(item => {
      const fieldData = Reflect.get(originData, item.fieldName)
      Reflect.set(instance, item.propertyName, fieldData)
    })

    return instance
  }

  public async rawFetch (request: () => Promise<T[]>): Promise<T[]> {
    return request()
      .then(entities => {
        if (Array.isArray(entities)) {
          this.attach(...entities)
        }

        return entities
      })
  }

  private async synchronizeAddedState (item: EntityTrace<T>): Promise<any> {
    const object = item.rawObject
    const identity = (a: any) => a

    const members = this.ctx.entityMetadata.getMembers(object.constructor.prototype)
    const behavior = this.ctx.entityMetadata.getBehavior(object.constructor.prototype, 'add')

    if (!behavior) {
      return (Promise.reject(new Error(`${object.constructor.name} 没有配置Add behavior`)))
    }

    const { mapParameters = identity, mapEntity = identity } = behavior

    const params = mapParameters(members.reduce((params, m) => {
      Reflect.set(params, m.fieldName, Reflect.get(object, m.propertyName))
      return params
    }, {}))

    return this.ctx.configuration.fetchJSON(behavior.url, { method: behavior.method }, params)
      .then(mapEntity)
      .then(res => {
        item.state = EntityState.Unchanged

        return res
      })
  }

  private async synchronizeDeletedState (item: EntityTrace<T>): Promise<any> {
    const object = item.rawObject
    const identity = (a: any) => a

    const primaryKeys = this.ctx.entityMetadata.getPrimaryKeys(object.constructor.prototype)
    const behavior = this.ctx.entityMetadata.getBehavior(object.constructor.prototype, 'delete')

    if (!behavior) {
      return (Promise.reject(new Error(`${object.constructor.name} 没有配置Delete behavior`)))
    }

    const { mapParameters = identity, mapEntity = identity } = behavior

    const params = mapParameters(primaryKeys.reduce((params, m) => {
      Reflect.set(params, m.fieldName, Reflect.get(object, m.propertyName))
      return params
    }, {}))

    return this.ctx.configuration.fetchJSON(behavior.url, { method: behavior.method }, params)
      .then(mapEntity)
      .then(res => {
        this.set.delete(item)
        return res
      })
  }

  private async synchronizeModifiedState (item: EntityTrace<T>): Promise<any> {
    const object = item.rawObject
    const identity = (a: any) => a

    const members = this.ctx.entityMetadata.getMembers(object.constructor.prototype)
    const behavior = this.ctx.entityMetadata.getBehavior(object.constructor.prototype, 'update')

    if (!behavior) {
      return (Promise.reject(new Error(`${object.constructor.name} 没有配置Update behavior`)))
    }

    const { mapParameters = identity, mapEntity = identity } = behavior

    const params = mapParameters(members.reduce((params, m) => {
      Reflect.set(params, m.fieldName, Reflect.get(object, m.propertyName))
      return params
    }, {}))

    return (this.ctx.configuration.fetchJSON(behavior.url, { method: behavior.method }, params)
      .then(mapEntity)
      .then(res => {
        item.state = EntityState.Unchanged
        return res
      }))
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

  private onPropertyChanged (tracer: EntityTrace<T>/*, e: PropertyChangeEvent<T, EntityState> */) {
    tracer.state = EntityState.Modified
  }
}
