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
    get configuration(): EntityConfiguration;
    fetch(url: string, options: RequestInit, data?: {}): Promise<Response>;
}
