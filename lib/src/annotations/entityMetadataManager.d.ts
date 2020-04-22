import MetadataType from './metadataType';
import Relationships from '../constants/relationship';
import Constraints from '../constants/constraints';
export declare type Store = {
    [key: string]: any;
};
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
 * 注解实体模型的成员字段元数据, 通过添加注解 @[[member]]() 产生
 *
 * @category annotations
 */
export interface Member extends Field {
    dataType?: {
        new (): object;
    };
}
/**
 * 注解实体模型的主键字段元数据, 通过添加注解 @[[primary]]() 产生
 *
 * @category annotations
 */
export interface PrimaryKey extends Field {
}
/**
 * 注解实体模型的外键字段元数据, 通过添加注解 @[[foreign]]() 产生
 *
 * @category annotations
 */
export interface ForeignKey extends Field {
    /**
     * 外键实体的构造函数
     */
    constructor: {
        new (): {};
    };
    /**
     * 导航字段名称
     */
    navigatorName: string;
}
/**
 * 注解实体模型的导航字段元数据, 通过添加注解 @[[navigator]]() 产生
 *
 * @category annotations
 */
export interface Navigator extends Field {
    /**
     * 实体间关系
     */
    relationship: Relationships;
    /**
     * 导航字段
     */
    navigatorName: string;
}
export interface EntitySet extends Field {
}
export declare type BehaviorName = 'load' | 'loadAll' | 'add' | 'delete' | 'update';
export interface Behavior<T = any> {
    behaviorName: BehaviorName | string;
    url: string;
    method: Method;
    mapParameters?: (...args: any[]) => T;
    mapEntity?: (a: any) => any;
}
export declare type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export { MetadataType, Relationships as Relationship };
/**
 * @module annotations
 * @class MetadataManager
 */
declare class EntityMetadataManager {
    private managedModel;
    private managedContext;
    register<T extends Member | MemberConstraints | PrimaryKey | ForeignKey | Behavior | Navigator | EntitySet>(prototype: Object, type: MetadataType, meta: T): number | Navigator | Behavior<any> | Record<string, Constraints | undefined> | undefined;
    unregister(prototype: Object): void;
    getMembers(prototype: Object): Member[];
    getMemberConstraints(prototype: Object): Record<string, Constraints | undefined>;
    getMemberConstraint(prototype: Object, propertyName: string): Constraints | undefined;
    getPrimaryKeys(prototype: Object): PrimaryKey[];
    getForeignKeys(prototype: Object): ForeignKey[];
    getBehavior(prototype: Object, behaviorName: BehaviorName | string): Behavior | undefined;
    getNavigator(prototype: Object, navigatorName: string): Navigator | undefined;
    getNavigators(prototype: Object): Navigator[];
    getEntitySet(prototype: Object, navigatorName: string): EntitySet | undefined;
    getEntitySets(prototype: Object): EntitySet[];
    entry(originData: {}, Type: {
        new (): object;
    }, isomorphism?: boolean): object | object[];
    reverse(instances: object | object[], Type: {
        new (): object;
    }): object | object[];
}
declare const manager: EntityMetadataManager;
export default manager;
