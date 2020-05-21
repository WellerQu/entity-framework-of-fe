import MetadataType from '../constants/metadataType';
import ConstraintOption from '../constants/constraintOption';
export { MetadataType, ConstraintOption };
/**
 * @module annotations
 * @class MetadataContext
 */
export declare class MetadataContext {
    constructor(plugins: (new (ctx: MetadataContext, next: IMetadata<{}> | undefined) => IMetadata<{}>)[]);
    private pluginInstances?;
    private managedModel;
    get model(): WeakMap<object, {}>;
    register<T extends Member | Constraints | Mapping>(prototype: object, type: MetadataType, meta: T): void;
    unregister(prototype: object): void;
    getRegisterData<T = any>(type: MetadataType, prototype: new () => object, propertyName?: string): T | undefined;
    entry(originData: object | undefined, Type: {
        new (): object;
    }, isomorphism?: boolean): object | object[] | never;
    revert(instances: object | object[], Type: {
        new (): object;
    }, constraints?: ConstraintOption): object | object[] | never;
}
