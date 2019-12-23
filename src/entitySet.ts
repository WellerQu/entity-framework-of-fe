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
    const stateTrace = Array.from(this.set).find(item => item.object === entity)

    if (stateTrace) {
      stateTrace.state = EntityState.Deleted
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
    const stateTrace = Array.from(this.set).find(item => item.object === entity)

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

  public load<R = any> (...args: any[]): Promise<R> {
    const queryMeta = this.ctx.metadata
      .getBehavior(this.entityMetadata.type.prototype, 'load')

    if (!queryMeta) {
      throw new Error('没有配置Load behavior')
    }

    // MOCK: 模拟返回数据
    const data = {
      id: 1,
      name: 'aaa',
      bid: 1,
      bName: 'bbb'
    } as any

    const thenable = new Promise<any>((resolve) => {
      const params = queryMeta.mapRequestParameters ? queryMeta.mapRequestParameters(...args) : {}
      // TODO: 发起请求
      console.log(`[${queryMeta.method}] fetch by ${queryMeta.url} ${JSON.stringify(params)}`)

      resolve({
        code: 0,
        data
      })
    })

    const attach = (/* data */) => {
      const Type = this.entityMetadata.type
      const entity = new Type()

      Reflect.ownKeys(data).forEach(key => {
        Reflect.set(entity, key, Reflect.get(data, key))
      })

      this.clear()
      this.attach(entity)

      const requests = Reflect.ownKeys(this.includes)
        .map(navigatorName => {
          const navigator = this.ctx.metadata.getNavigator(this.entityMetadata.type.prototype, navigatorName as string)
          if (!navigator) {
            return null
          }

          return this.includes[navigatorName as string]
        })
        .filter(item => item !== null)

      if (requests.length > 0) {
        return Promise.all(requests.map(fn => fn!(entity)))
      }

      return data
    }

    if (!queryMeta.mapEntityData) {
      return thenable.then(attach)
    }

    return thenable.then(queryMeta.mapEntityData).then(attach)
  }

  public loadAll<R = any> (...args: any[]): Promise<R[]> {
    const queryMeta = this.ctx.metadata.getBehavior(this.entityMetadata.type.prototype, 'loadAll')
    if (!queryMeta) {
      throw new Error('没有配置LoadAll behavior')
    }

    const thenable = new Promise<any>((resolve, reject) => {
      const params = queryMeta.mapRequestParameters ? queryMeta.mapRequestParameters(...args) : {}
      // TODO: 发起请求
      // console.log(`[${queryMeta.method}] fetch by ${queryMeta.url} ${JSON.stringify(params)}`)
      resolve({
        code: 0,
        data: [{
          id: 1
        }]
      })
    })

    if (!queryMeta || !queryMeta.mapEntityData) {
      return thenable
    }

    return thenable.then(queryMeta.mapEntityData)
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

    const getRequestParameters = (entity: T) => foreignKeys.map(key => Reflect.get(entity, key.fieldName))

    const request = (entity: T) => new Promise((resolve, reject) => {
      const parameters = getRequestParameters(entity)

      // 发起请求
      if (navigator.relationship === Relationship.One) {
        return entitySet.load(...parameters).then((data) => {
          const relatedEntity = entitySet.find(...parameters)

          Reflect.set(entity, navigatorName, relatedEntity)

          resolve(data)
        }, reject)
      } else if (navigator.relationship === Relationship.Many) {
        return Promise.all(parameters.map(params => entitySet.load(...params))).then((res) => {
          res.forEach(relatedEntity => {
            const collection = Reflect.get(entity, navigatorName) || []
            collection.push(relatedEntity)

            Reflect.set(entity, navigatorName, collection)
          })
          resolve(res)
        })
      } else {
        throw new Error('未定义的Relationship')
      }
    })

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
