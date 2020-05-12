import { Store, Constraints } from './annotations/entityMetadataManager';
export default class EntitySet<T extends Object> {
    constructor(type: {
        new (): T;
    });
    private entityMetadata;
    /**
     * 将原始JSON数据反序列化成 Entity 实例
     * @param originData 原始数据
     * @param isomorphism 是否是同构数据, 默认为异构
     * @returns 填充数据的实例
     */
    deserialize(originData: {} | undefined, isomorphism?: boolean): T | T[] | undefined;
    /**
     * 将 Entity 实例序列化成JSON数据
     * @param entity 数据来源实体实例
     * @returns 原始数据
     */
    serialize(entity: T, constraints?: Constraints): Store;
}
