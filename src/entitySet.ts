import EntityContext from './entityContext'
import EntityState from './entityState'
import EntityTrace, { PropertyChangeEvent } from './entityTrace'
import Relationship from './annotations/relationship'

export default class EntitySet<T extends Object> {
  constructor (private ctx: EntityContext, type: { new(): T}) {
    this.set = new Set<EntityTrace<T>>()
    this.includes = {}
    this.entityMetadata = {
      type
    }
  }

  private set: Set<EntityTrace<T>>
  private includes: Record <string, (entity: T) => Promise < any >>
  private entityMetadata: {
    type: { new() : T },
  }

  public get size () {
    return this.set.size
  }

  public clear (): this {
    Array.from(this.set).forEach(item => item.offPropertyChange(this.onPropertyChanged))
    this.set.clear()
    this.includes = {}

    return this
  }

  public add (element: T): this {
    const tracer = new EntityTrace(element, EntityState.Added)
    tracer.onPropertyChange(this.onPropertyChanged)

    this.set.add(tracer)

    return this
  }

  public remove (entity?: T): this {
    const stateTrace = Array.from(this.set).find(item => item.object === entity && item.state !== EntityState.Deleted)

    if (stateTrace) {
      stateTrace.state = EntityState.Deleted
      stateTrace.offPropertyChange(this.onPropertyChanged)
      stateTrace.revoke()
    }

    return this
  }

  public attach (...elements: T[]): this {
    elements.forEach(item => {
      const tracer = new EntityTrace(item, EntityState.Unchanged)
      tracer.onPropertyChange(this.onPropertyChanged)

      this.set.add(tracer)
    })

    return this
  }

  public detach (entity?: T): this {
    const stateTrace = Array.from(this.set).find(item => item.object === entity && item.state !== EntityState.Detached)

    if (stateTrace) {
      stateTrace.state = EntityState.Detached
      stateTrace.offPropertyChange(this.onPropertyChanged)
      stateTrace.revoke()
    }

    return this
  }

  public find (...primaryKeys: any[]): T | undefined {
    const stateTrace = Array.from(this.set).find(item => {
      const keys = this.ctx.metadata.getPrimaryKeys(item.object.constructor.prototype)
      if (keys.length === 0) {
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

  public findAll (fn: (n: T) => boolean): T[] {
    const stateTraces = Array.from(this.set).filter(item => {
      return fn(Object.freeze(item.object))
    })

    return stateTraces.map(item => item.object)
  }

  public toList (): T[] {
    return Array.from(this.set).map(item => Object.freeze(item.object))
  }

  private attachDataToEntitySet (...originData: T[]): Promise<T[]> {
    const Type = this.entityMetadata.type
    const includes = this.includes

    this.clear()

    return Promise.all(originData.map(data => {
      const entity = new Type()
      Reflect.ownKeys(data).forEach(key => {
        Reflect.set(entity, key, Reflect.get(data, key))
      })

      this.attach(entity)

      const requests = Reflect.ownKeys(includes)
        .map(navigatorName => {
          const navigator = this.ctx.metadata.getNavigator(Type.prototype, navigatorName as string)
          if (!navigator) {
            return null
          }

          return includes[navigatorName as string]
        })
        .filter(item => item !== null)

      return new Promise<T>((resolve, reject) => {
        if (requests.length > 0) {
          Promise.all(requests.map(fn => fn!(entity))).then(() => {
            resolve(data)
          }, reject)
        } else {
          resolve(data)
        }
      })
    }))
  }

  public load (...args: any[]): Promise<T> {
    const queryMeta = this.ctx.metadata
      .getBehavior(this.entityMetadata.type.prototype, 'load')

    if (!queryMeta) {
      throw new Error('没有配置Load behavior')
    }

    const params = queryMeta.mapRequestParameters ? queryMeta.mapRequestParameters(...args) : args
    const thenable = this.ctx.configuration.fetchJSON(queryMeta.url, { method: queryMeta.method }, params)

    if (!queryMeta.mapEntityData) {
      return thenable.then((data) => this.attachDataToEntitySet(data).then(res => res[0]))
    }

    return thenable.then(queryMeta.mapEntityData).then(data => this.attachDataToEntitySet(data).then(res => res[0]))
  }

  public loadAll (...args: any[]): Promise<T[]> {
    const queryMeta = this.ctx.metadata.getBehavior(this.entityMetadata.type.prototype, 'loadAll')
    if (!queryMeta) {
      throw new Error('没有配置LoadAll behavior')
    }

    const params = queryMeta.mapRequestParameters ? queryMeta.mapRequestParameters(...args) : args
    const thenable = this.ctx.configuration.fetchJSON(queryMeta.url, { method: queryMeta.method }, params)

    if (!queryMeta.mapEntityData) {
      return thenable.then((data) => this.attachDataToEntitySet(...data))
    }

    return thenable.then(queryMeta.mapEntityData).then(data => this.attachDataToEntitySet(...data))
  }

  public include (navigatorName: string): this {
    if (this.includes[navigatorName]) {
      return this
    }

    const navigator = this.ctx.metadata.getNavigator(this.entityMetadata.type.prototype, navigatorName as string)
    if (!navigator) {
      throw new Error(`没有配置Navigator "${navigatorName}" 属性成员`)
    }

    const entitySet = Reflect.get(this.ctx, navigatorName) as EntitySet<any>
    if (!entitySet) {
      throw new Error(`当前上下文中没有配置EntitySet "${navigatorName}"`)
    }

    const foreignKeys = this.ctx.metadata
      .getForeignKeys(this.entityMetadata.type.prototype)
      .filter(key => key.navigatorName === navigatorName)

    const getRequestParameters = (entity: T) => foreignKeys.map(key => Reflect.get(entity, key.propertyName))

    const request = (entity: T) => {
      const parameters = getRequestParameters(entity)

      // 发起请求
      if (navigator.relationship === Relationship.One) {
        return entitySet.load(...parameters).then((data) => {
          const relatedEntity = entitySet.find(...parameters)
          Reflect.set(entity, navigatorName, relatedEntity)

          return data
        })
      } else if (navigator.relationship === Relationship.Many) {
        const allRequests = parameters
          .map(params => params.map((primaryKey: any) => entitySet.load(primaryKey)))
          .reduce((acc, val) => acc.concat(val))
        return Promise.all(allRequests).then((res) => {
          res.forEach(relatedEntity => {
            const collection = Reflect.get(entity, navigatorName) || []
            collection.push(relatedEntity)

            Reflect.set(entity, navigatorName, collection)
          })

          return res
        })
      } else {
        throw new Error('未定义的Relationship')
      }
    }

    this.includes[navigatorName] = request

    return this
  }

  public rawFetch (): this {
    throw new Error('Not implemented')
  }

  private onPropertyChanged (tracer: EntityTrace<T>, e: PropertyChangeEvent<T, EntityState>) {
    console.log(`${e.value} -> ${e.newValue}`) // eslint-disable-line no-console
    tracer.state = EntityState.Modified
  }
}
