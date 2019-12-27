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
    const entitySetMeta = this.ctx.metadata.getEntitySet(ctxPrototype, navigatorName)
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
    return this.cleanSet().cleanOwnNavigators()
  }

  private cleanSet (): this {
    Array.from(this.set).forEach(item => item.offPropertyChange(this.onPropertyChanged))
    this.set.clear()

    return this
  }

  private cleanOwnNavigators (): this {
    this.ownNavigatorRequests = {}

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
    const navigators = this.ctx.metadata.getNavigators(this.entityMetadata.type.prototype)

    entities.filter(item => !!item).forEach(removedItem => {
      const tracer = Array.from(this.set)
        .find(item => item.object === removedItem &&
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
          item.object === detachedItem &&
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

  public find (...primaryKeys: any[]): T | undefined {
    const stateTrace = Array.from(this.set).find(item => {
      const keys = this.ctx.metadata.getPrimaryKeys(item.object.constructor.prototype)
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
    const queryMeta = this.ctx.metadata
      .getBehavior(this.entityMetadata.type.prototype, 'load')

    if (!queryMeta) {
      throw new Error(`${this.entityMetadata.type.name} 没有配置Load behavior`)
    }

    const nothingTodo = (...a: any[]) => a
    const { mapParameters = nothingTodo, mapEntity = nothingTodo } = queryMeta
    const params = mapParameters(...args)
    const requests = Object.values(this.ownNavigatorRequests)

    this.clean()

    return new Promise<T>((resolve, reject) => {
      this.ctx.configuration
        .fetchJSON(queryMeta.url, { method: queryMeta.method }, params)
        .then(mapEntity, reject)
        .then(data => {
          const entity = this.attachDataToEntitySet(data)
          Promise.all(requests.map(fn => fn(entity))).then(() => {
            resolve(data)
          })
        })
    })
  }

  public async loadAll (...args: any[]): Promise<T[]> {
    const queryMeta = this.ctx.metadata
      .getBehavior(this.entityMetadata.type.prototype, 'loadAll')
    if (!queryMeta) {
      throw new Error(`${this.entityMetadata.type.name} 没有配置LoadAll behavior`)
    }

    const nothingTodo = (...a: any[]) => a
    const { mapParameters = nothingTodo, mapEntity = nothingTodo } = queryMeta
    const params = mapParameters(...args)
    const requests = Object.values(this.ownNavigatorRequests)

    this.clean()

    return new Promise<T[]>((resolve, reject) => {
      this.ctx.configuration
        .fetchJSON(queryMeta.url, { method: queryMeta.method }, params)
        .then(mapEntity, reject)
        .then((data: T[]) => {
          const promises = data
            .map(item => this.attachDataToEntitySet(item))
            .map(entity => requests.map(fn => fn(entity)))
            .reduce((acc, val) => acc.concat(val))
          Promise.all(promises).then(() => {
            resolve(data)
          })
        })
    })
  }

  public include (navigatorName: string): this {
    if (this.ownNavigatorRequests[navigatorName]) {
      return this
    }

    const entitySet = this.getRelatedEntitySet(navigatorName)

    const navigator = this.ctx.metadata.getNavigator(this.entityMetadata.type.prototype, navigatorName as string)
    if (!navigator) {
      this.otherNavigators.push(navigatorName)
      return this
    }

    const foreignKeys = this.ctx.metadata
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
      // 释放导航信息
      this.otherNavigators = [] // fix: 修复未释放资源的问题

      // 发起请求
      if (navigator.relationship === Relationship.One) {
        return set.load(...parameters).then((data) => {
          const relatedEntity = set.find(...parameters)
          Reflect.set(entity, propertyName, relatedEntity)

          return data
        })
      } else if (navigator.relationship === Relationship.Many) {
        // FIXME: 读取不到数据? 先别删这段注释的代码
        // const processParameters = (parameters: any[][]) =>
        //   (exec: (primaryKey: any[]) => any) =>
        //     parameters
        //       .filter(params => !!params)
        //       .map(params => params.map(primaryKey => exec(primaryKey)))
        //       .reduce((acc, val) => acc.concat(val), [])
        // const validRequests = processParameters(parameters)
        // const collectResult = processParameters(parameters)
        // Promise.all(validRequests((primaryKey: any) => set.load(primaryKey))).then(res => {
        //   const collection = collectResult((primaryKey: any) => set.find(primaryKey))

        //   Reflect.set(entity, propertyName, collection)

        //   return res
        // })
        const validParameters = parameters.filter(params => !!params)
        const allLoadRequests = validParameters
          .map(params => params.map((primaryKey: any) => set.load(primaryKey)))
          .reduce((acc, val) => acc.concat(val), [])
        return Promise.all(allLoadRequests).then((res) => {
          const collection = validParameters
            .map(params => params.map((primaryKey: any) => set.find(primaryKey)))
            .reduce((acc, val) => acc.concat(val), [])

          Reflect.set(entity, propertyName, collection)

          return res
        })
      } else {
        throw new Error('未定义的Relationship')
      }
    }

    request.navigatorName = navigatorName

    this.ownNavigatorRequests[navigatorName] = request

    return this
  }

  public entry (originData: {}): T {
    const Type = this.entityMetadata.type
    const instance = new Type()

    const members = this.ctx.metadata.getMembers(Type.prototype)
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

  public synchronizeState (): Promise<any>[] {
    return Array.from(this.set)
      .filter(item => item.state === EntityState.Added ||
        item.state === EntityState.Modified ||
        item.state === EntityState.Deleted ||
        item.state === EntityState.Detached)
      .map(async tracer => {
        const state = tracer.state
        const object = tracer.rawObject
        const identity = (a: any) => a

        if (state === EntityState.Added) {
          const members = this.ctx.metadata.getMembers(object.constructor.prototype)
          const behavior = this.ctx.metadata.getBehavior(object.constructor.prototype, 'add')

          if (!behavior) {
            return Promise.reject(new Error(`${object.constructor.name} 没有配置Add behavior`))
          }

          const { mapParameters = identity, mapEntity = identity } = behavior

          const params = mapParameters(members.reduce((params, m) => {
            Reflect.set(params, m.fieldName, Reflect.get(object, m.propertyName))
            return params
          }, {}))

          return this.ctx.configuration.fetchJSON(behavior.url, { method: behavior.method }, params)
            .then(mapEntity)
            .then(res => {
              tracer.state = EntityState.Unchanged
              return res
            })
        }

        if (state === EntityState.Deleted) {
          const primaryKeys = this.ctx.metadata.getPrimaryKeys(object.constructor.prototype)
          const behavior = this.ctx.metadata.getBehavior(object.constructor.prototype, 'delete')

          if (!behavior) {
            return Promise.reject(new Error(`${object.constructor.name} 没有配置Delete behavior`))
          }

          const { mapParameters = identity, mapEntity = identity } = behavior

          const params = mapParameters(primaryKeys.reduce((params, m) => {
            Reflect.set(params, m.fieldName, Reflect.get(object, m.propertyName))
            return params
          }, {}))

          return this.ctx.configuration.fetchJSON(behavior.url, { method: behavior.method }, params)
            .then(mapEntity)
            .then(res => {
              this.set.delete(tracer)
              return res
            })
        }

        if (state === EntityState.Modified) {
          const members = this.ctx.metadata.getMembers(object.constructor.prototype)
          const behavior = this.ctx.metadata.getBehavior(object.constructor.prototype, 'update')

          if (!behavior) {
            return Promise.reject(new Error(`${object.constructor.name} 没有配置Update behavior`))
          }

          const { mapParameters = identity, mapEntity = identity } = behavior

          const params = mapParameters(members.reduce((params, m) => {
            Reflect.set(params, m.fieldName, Reflect.get(object, m.propertyName))
            return params
          }, {}))

          return this.ctx.configuration.fetchJSON(behavior.url, { method: behavior.method }, params)
            .then(mapEntity)
            .then(res => {
              tracer.state = EntityState.Unchanged
              return res
            })
        }

        if (state === EntityState.Detached) {
          return Promise.resolve().then(() => {
            this.set.delete(tracer)
            return true
          })
        }
      })
  }

  private onPropertyChanged (tracer: EntityTrace<T>/*, e: PropertyChangeEvent<T, EntityState> */) {
    tracer.state = EntityState.Modified
  }
}
