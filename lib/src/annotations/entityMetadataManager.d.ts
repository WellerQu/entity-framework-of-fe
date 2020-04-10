import MetadataType from './metadataType';
import Relationship from './relationship';
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
    relationship: Relationship;
    /**
     * 导航字段
     */
    navigatorName: string;
}
export interface EntitySet extends Field {
}
export declare type BehaviorName = 'load' | 'loadAll' | 'add' | 'delete' | 'update';
export interface Behavior<T = any> {
    behaviorName: BehaviorName;
    url: string;
    method: Method;
    mapParameters?: (...args: any[]) => T;
    mapEntity?: (response: Response) => Promise<T>;
}
export declare type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export { MetadataType, Relationship };
/**
 * @module annotations
 * @class MetadataManager
 */
declare class EntityMetadataManager {
    private managedModel;
    private managedContext;
    register<T extends Member | PrimaryKey | ForeignKey | Behavior | Navigator | EntitySet>(prototype: Object, type: MetadataType, meta: T): number | Navigator | Behavior<any> | undefined;
    unregister(prototype: Object): void;
    getMembers(prototype: Object): Member[];
    getPrimaryKeys(prototype: Object): PrimaryKey[];
    getForeignKeys(prototype: Object): ForeignKey[];
    getBehavior(prototype: Object, behaviorName: BehaviorName): Behavior | undefined;
    getNavigator(prototype: Object, navigatorName: string): Navigator | undefined;
    getNavigators(prototype: Object): Navigator[];
    getEntitySet(prototype: Object, navigatorName: string): EntitySet | undefined;
    getEntitySets(prototype: Object): EntitySet[];
}
declare const manager: EntityMetadataManager;
export default manager;
