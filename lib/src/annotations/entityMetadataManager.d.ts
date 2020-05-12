import MetadataType from './metadataType';
import Constraints from '../constants/constraints';
export declare type Store = {
    [key: string]: any;
};
export { MetadataType, Constraints };
/**
 * 注解实体模型的字段元数据
 *
 * @category annotations
 */
export interface Field {
    /**
     * 字段名称
     */
    fieldName: string;
    /**
     * 属性名称
     */
    propertyName: string;
}
/**
 * 注解实体模型的成员字段元数据, 通过添加注解 @[[member]]() 产生
 *
 * @category annotations
 */
export interface Member extends Field {
    dataType?: () => {
        new (): object;
    };
}
/**
 * 成员数据值得约束
 *
 * @category annotations
 */
export interface MemberConstraints {
    /**
     * 成员值约束
     */
    constraints: Constraints;
    /**
     * 属性名
     */
    propertyName: string;
}
/**
 * @module annotations
 * @class MetadataManager
 */
declare class EntityMetadataManager {
    private managedModel;
    register<T extends Member | MemberConstraints>(prototype: Object, type: MetadataType, meta: T): number | Record<string, Constraints | undefined> | undefined;
    unregister(prototype: Object): void;
    getMembers(prototype: Object): Member[];
    getMemberConstraints(prototype: Object): Record<string, Constraints | undefined>;
    getMemberConstraint(prototype: Object, propertyName: string): Constraints | undefined;
    entry(originData: {} | undefined, Type: {
        new (): object;
    }, isomorphism?: boolean): object | object[];
    reverse(instances: object | object[], Type: {
        new (): object;
    }, constraints?: Constraints): object | object[];
}
declare const manager: EntityMetadataManager;
export default manager;
