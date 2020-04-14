import EntityState from './entityState'

export interface PropertyChangeEvent<T extends Object, P = any> {
  propertyName: string;
  value: P;
  newValue: P;
}

export type PropertyChangeHandler<T> = (tracer: EntityTrace<T>, e: PropertyChangeEvent<T>) => void

export default class EntityTrace<T extends Object> {
  constructor (private origin: T, public state: EntityState = EntityState.Unchanged) {
    const sender = this

    const { proxy, revoke } = Proxy.revocable(origin, {
      set (target: T, property: string, value: any) {
        if (property in target) {
          const oldValue = Reflect.get(target, property)

          const event = {
            propertyName: property,
            value: oldValue,
            newValue: value
          }

          sender.propertyBeforeChangeHandlers.forEach(fn => fn(sender, event))
          Reflect.set(target, property, value)
          sender.propertyAfterChangeHandlers.forEach(fn => fn(sender, event))
          return true
        }

        return false
      }
    })

    this.proxy = proxy
    this.revoke = revoke
  }

  public get object () {
    return this.proxy
  }

  public get rawObject () {
    return this.origin
  }

  private proxy: T
  public revoke: () => void

  private propertyBeforeChangeHandlers: PropertyChangeHandler<T>[] = []
  public onPropertyBeforeChange (handler: PropertyChangeHandler<T>) {
    this.propertyBeforeChangeHandlers.push(handler)
  }
  public offPropertyBeforeChange (handler: PropertyChangeHandler<T>) {
    this.propertyBeforeChangeHandlers = this.propertyBeforeChangeHandlers.filter(item => item !== handler)
  }

  private propertyAfterChangeHandlers: PropertyChangeHandler<T>[] = []
  public onPropertyAfterChange (handler: PropertyChangeHandler<T>) {
    this.propertyAfterChangeHandlers.push(handler)
  }
  public offPropertyAfterChange (handler: PropertyChangeHandler<T>) {
    this.propertyAfterChangeHandlers = this.propertyAfterChangeHandlers.filter(item => item !== handler)
  }
}
