import EntityState from './entityState';
export interface PropertyChangeEvent<T extends Object, P = any> {
    propertyName: string;
    value: P;
    newValue: P;
}
export declare type PropertyChangeHandler<T> = (tracer: EntityTrace<T>, e: PropertyChangeEvent<T>) => void;
export default class EntityTrace<T extends Object> {
    private origin;
    state: EntityState;
    constructor(origin: T, state?: EntityState);
    readonly object: T;
    readonly rawObject: T;
    private proxy;
    revoke: () => void;
    private propertyChangeHandlers;
    onPropertyChange(handler: PropertyChangeHandler<T>): void;
    offPropertyChange(handler: PropertyChangeHandler<T>): void;
}
