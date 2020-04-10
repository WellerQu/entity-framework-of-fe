import EntityConfiguration from './entityConfiguration';
/**
 * @example
 * ```typescript
 * class YourContext extends EntityContext {
 * }
 *
 * const ctx = new YourContext()
 * ```
 */
export default class EntityContext {
    constructor(configuration: EntityConfiguration);
    private _configuration;
    readonly configuration: EntityConfiguration;
    clean(): this;
    saveChanges<T = any>(): Promise<T[]>;
}
