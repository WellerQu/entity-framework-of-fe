import EntityState from './entityState'

export interface PropertyChangeEvent<T extends Object, P = any> {
  propertyName: string;
  value: P;
  newValue: P;
}

export type PropertyChangeHandler<T> = (tracer: EntityTrace<T>, e: PropertyChangeEvent<T>) => void

export default class EntityTrace<T extends Object> {
  constructor (private origin: T, public state: EntityState = EntityState.Unchanged) {
    const propertyChange = (propertyName: string, value: any, newValue: any) => {
      const event = {
        propertyName,
        value,
        newValue
      }
      this.propertyChangeHandlers.forEach(fn => fn(this, event))
    }

    const { proxy, revoke } = Proxy.revocable(origin, {
      set (target: T, property: string, value: any) {
        if (property in target) {
          const oldValue = Reflect.get(target, property)
          Reflect.set(target, property, value)
          propertyChange(property, oldValue, value)
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

  private propertyChangeHandlers: PropertyChangeHandler<T>[] = []

  public onPropertyChange (handler: PropertyChangeHandler<T>) {
    this.propertyChangeHandlers.push(handler)
  }
  public offPropertyChange (handler: PropertyChangeHandler<T>) {
    this.propertyChangeHandlers = this.propertyChangeHandlers.filter(item => item !== handler)
  }
}
