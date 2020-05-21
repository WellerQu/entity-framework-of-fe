import { ConstraintOption } from './annotations';
export default class EntitySet<T extends Object> {
    constructor(type: {
        new (): T;
    });
    private entityMetadata;
    /**
     * 将 原始数据 反序列化成 实体数据
     * @param originData 原始数据
     * @param isomorphism 是否是同构数据, 默认为异构
     * @returns 实体数据
     */
    deserialize(originData: object | undefined, isomorphism?: boolean): T | T[] | undefined;
    /**
     * 将 实体数据 序列化成 原始数据
     * @param entity 实体数据
     * @returns 原始数据
     */
    serialize(entity: T | undefined, constraints?: ConstraintOption): Store | undefined;
}
