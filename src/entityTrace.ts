import EntityState from './entityState'

export interface PropertyChangeEvent<T extends Object, P = any> {
  propertyName: string;
  value: P;
  newValue: P;
}

export default class EntityTrace<T extends Object> {
  constructor (origin: T, public state: EntityState = EntityState.Unchanged) {
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

  private proxy: T
  public revoke: () => void

  private propertyChangeHandlers: ((tracer: EntityTrace<T>, e: PropertyChangeEvent<T>) => void)[] = []

  public onPropertyChange (handler: (tracer: EntityTrace<T>, e: PropertyChangeEvent<T>) => void) {
    this.propertyChangeHandlers.push(handler)
  }
  public offPropertyChange (handler: (tracer: EntityTrace<T>, e: PropertyChangeEvent<T>) => void) {
    this.propertyChangeHandlers = this.propertyChangeHandlers.filter(item => item !== handler)
  }
}
