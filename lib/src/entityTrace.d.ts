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
    private propertyBeforeChangeHandlers;
    onPropertyBeforeChange(handler: PropertyChangeHandler<T>): void;
    offPropertyBeforeChange(handler: PropertyChangeHandler<T>): void;
    private propertyAfterChangeHandlers;
    onPropertyAfterChange(handler: PropertyChangeHandler<T>): void;
    offPropertyAfterChange(handler: PropertyChangeHandler<T>): void;
}
