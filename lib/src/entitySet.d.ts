import EntityContext from './entityContext';
export declare type OriginJSON = Promise<any>;
declare type Store = {
    [key: string]: any;
};
export default class EntitySet<T extends Object> {
    private ctx;
    constructor(ctx: EntityContext, type: {
        new (): T;
    });
    private set;
    private ownNavigatorRequests;
    private otherNavigators;
    private entityMetadata;
    private parseOriginDataToEntity;
    private getRelatedEntitySet;
    readonly size: number;
    clean(): this;
    private cleanSet;
    private cleanNavigators;
    add(...entities: (T | undefined)[]): this;
    remove(...entities: (T | undefined)[]): this;
    attach(...entities: (T | undefined)[]): this;
    detach(...entities: (T | undefined)[]): this;
    /**
     * 通过传入的主键在数据集中查询实体实例, 参数的顺序为实体模型中被注解为 @[[primary]]() 的字段的顺序
     *
     * @example
     * ```typescript
     * class Foo {
     *   @primary()
     *   id: number = 0
     *   @primary()
     *   version: number = 0
     * }
     *
     * ctx.foo.find(1, 2)
     * // 参数 1 作为id, 参数 2 作为version
     * ```
     *
     * @param primaryKeys {...any[]} 主键字段
     * @returns
     */
    find(...primaryKeys: any[]): T | undefined;
    filter(fn: (n: T) => boolean): T[];
    toList(): T[];
    load(...args: any[]): Promise<Response>;
    loadAll<P = any>(...args: any[]): Promise<P>;
    include(navigatorName: string): this;
    entry(originData: {}, entity?: T): T;
    reverse(entity: T): Store;
    /**
     * 将同构数据填充到实体实例, 如果默认实体实例为空, 则会创建新实例
     * @param originData 与 T 同构的数据
     * @param entity 实体实例
     * @returns 实体实例
     */
    fill(originData: {}, entity?: T): T;
    rawQuery(query: (fetch: (url: string, options: RequestInit, data?: {}) => Promise<Response>) => Promise<T[] | T>): Promise<T[]>;
    private applyConstraints;
    private synchronizeAddedState;
    private synchronizeDeletedState;
    private synchronizeModifiedState;
    synchronizeState(): Promise<any>[];
    private onPropertyBeforeChange;
    private onPropertyAfterChange;
}
export {};
